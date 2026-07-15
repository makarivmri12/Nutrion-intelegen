import React, { useState, useMemo } from "react";
import { usePatientStore, calculateAge } from "../../store/usePatientStore";
import { 
  Zap, 
  Clock, 
  Gauge, 
  ChevronRight, 
  TrendingDown, 
  TrendingUp, 
  Calculator, 
  Activity,
  AlertCircle,
  Percent,
  Compass
} from "lucide-react";

interface ActivityItem {
  name: string;
  durationMin: number; // in minutes
  energyCostKjKgHr: number; // in kJ / kg / hour
}

export default function EnergyCalculator() {
  const { patients, activePatientId, calculateBMR, calculateBMI } = usePatientStore();
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  // Personal data state (defaulting to active patient or standard placeholders)
  const [age, setAge] = useState(activePatient ? calculateAge(activePatient.dob) : 30);
  const [sex, setSex] = useState<"male" | "female">(activePatient ? activePatient.sex : "male");
  const [height, setHeight] = useState(activePatient ? activePatient.height : 170);
  const [weight, setWeight] = useState(activePatient ? activePatient.weight : 70);
  
  // Kind of Work select
  const [workLevel, setWorkLevel] = useState<string>("light");

  // Detailed activities table state
  const [activities, setActivities] = useState<ActivityItem[]>([
    { name: "Sleeping (Tidur)", durationMin: 480, energyCostKjKgHr: 4.0 }, // 8 hours
    { name: "Eating (Makan/Duduk)", durationMin: 120, energyCostKjKgHr: 6.0 }, // 2 hours
    { name: "Light Work (Kerja Ringan/Kantor)", durationMin: 480, energyCostKjKgHr: 8.0 }, // 8 hours
    { name: "Walking (Berjalan)", durationMin: 60, energyCostKjKgHr: 15.0 }, // 1 hour
    { name: "Cycling (Bersepeda)", durationMin: 30, energyCostKjKgHr: 25.0 }, // 30 min
    { name: "Swimming (Berenang)", durationMin: 0, energyCostKjKgHr: 35.0 },
    { name: "Running (Berlari)", durationMin: 0, energyCostKjKgHr: 45.0 },
    { name: "Relaxing/Leisure (Santai/Lainnya)", durationMin: 270, energyCostKjKgHr: 5.0 }, // remaining to hit 24 hrs
  ]);

  // Adjust activity duration
  const handleDurationChange = (idx: number, val: number) => {
    const updated = [...activities];
    updated[idx].durationMin = Math.max(0, val);
    setActivities(updated);
  };

  // Adjust activity energy cost
  const handleEnergyCostChange = (idx: number, val: number) => {
    const updated = [...activities];
    updated[idx].energyCostKjKgHr = Math.max(0, val);
    setActivities(updated);
  };

  // Synchronize state when patient changes
  const handleSyncPatient = () => {
    if (activePatient) {
      setAge(calculateAge(activePatient.dob));
      setSex(activePatient.sex);
      setHeight(activePatient.height);
      setWeight(activePatient.weight);
    }
  };

  // Main Calculation Engine
  const calculationResults = useMemo(() => {
    // 1. Basal Metabolic Rate (BMR) in kcal/day (using Mifflin-St Jeor)
    const bmrKcal = sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // Convert BMR to kJ/day (1 kcal = 4.184 kJ)
    const bmrKj = bmrKcal * 4.184;

    // 2. Active Metabolic Expenditure (Thermic effect of activities)
    // Formula: energy (kJ) = Weight (kg) * Duration (hours) * EnergyCost (kJ/kg/hour)
    let totalActivityKj = 0;
    let totalMinutes = 0;

    activities.forEach(act => {
      const hours = act.durationMin / 60;
      const energyKj = weight * hours * act.energyCostKjKgHr;
      totalActivityKj += energyKj;
      totalMinutes += act.durationMin;
    });

    // 3. Work multipliers / Kind of work additional allowance (kcal)
    // Very light (+10%), Light (+20%), Medium (+30%), Heavy (+50%), Very Heavy (+70%)
    let workAllowancePercent = 0.20; // default light
    if (workLevel === "veryLight") workAllowancePercent = 0.10;
    else if (workLevel === "light") workAllowancePercent = 0.20;
    else if (workLevel === "medium") workAllowancePercent = 0.30;
    else if (workLevel === "heavy") workAllowancePercent = 0.50;
    else if (workLevel === "veryHeavy") workAllowancePercent = 0.70;

    const workKcal = bmrKcal * workAllowancePercent;

    // Convert total activity energy to kcal
    const activityKcal = totalActivityKj / 4.184;

    // Total Energy requirement = Basal + Work Allowance + Physical Activity
    const totalKcal = bmrKcal + workKcal + activityKcal;

    return {
      bmrKcal,
      activityKcal: Math.round(activityKcal),
      workKcal: Math.round(workKcal),
      totalKcal: Math.round(totalKcal),
      totalMinutes,
      is24Hours: totalMinutes === 1440
    };
  }, [age, sex, height, weight, activities, workLevel]);

  // BMI calculation for the local inputs
  const currentBmi = useMemo(() => {
    const hM = height / 100;
    if (!hM) return 0;
    return parseFloat((weight / (hM * hM)).toFixed(1));
  }, [weight, height]);

  const bmiCategory = useMemo(() => {
    if (currentBmi < 18.5) return { label: "Underweight", color: "text-amber-400 border-amber-500/30 bg-amber-950/20" };
    if (currentBmi < 25) return { label: "Normal Weight", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20" };
    if (currentBmi < 30) return { label: "Overweight", color: "text-orange-400 border-orange-500/30 bg-orange-950/20" };
    return { label: "Obese", color: "text-rose-400 border-rose-500/30 bg-rose-950/20" };
  }, [currentBmi]);

  // Guidelines for reduction / gains state
  const [activePlan, setActivePlan] = useState<"reduction" | "gain" | null>(null);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 font-sans text-zinc-300" id="energy-calculator-container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#7c3aed]" />
            <span>High-Fidelity Physical Energy Cost Calculator</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Specify clinical physical tasks and hourly metabolic costs (kJ/kg/h) to compute precise energy demands.
          </p>
        </div>

        {activePatient && (
          <button
            onClick={handleSyncPatient}
            className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-[10px] rounded text-zinc-300 font-mono font-medium border border-zinc-700 flex items-center space-x-1 transition-all cursor-pointer"
          >
            <span>Sync with active patient ({activePatient.name})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Parameters Form */}
        <div className="space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Clinical Anthropometrics
            </span>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Gender</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed] cursor-pointer"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kind of Work select */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-3">
              Type of Work / Occupation Load
            </span>

            <div className="space-y-2">
              {[
                { key: "veryLight", label: "Very Light (Tambahan +10% BMR)", desc: "Sitting, reading, minimal walking" },
                { key: "light", label: "Light (Tambahan +20% BMR)", desc: "Office desks, teaching, light standing" },
                { key: "medium", label: "Medium (Tambahan +30% BMR)", desc: "Housework, active standing, fast walking" },
                { key: "heavy", label: "Heavy (Tambahan +50% BMR)", desc: "Construction work, continuous heavy lifting" },
                { key: "veryHeavy", label: "Very Heavy (Tambahan +70% BMR)", desc: "Professional athletes, lumberjacks" },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start space-x-3 p-2.5 rounded border transition-colors cursor-pointer ${
                    workLevel === item.key 
                      ? "bg-purple-950/10 border-purple-500/40 text-white" 
                      : "bg-[#1a1a1a] border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="workLevel"
                    value={item.key}
                    checked={workLevel === item.key}
                    onChange={() => setWorkLevel(item.key)}
                    className="mt-0.5 text-[#7c3aed] focus:ring-[#7c3aed] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold block">{item.label}</span>
                    <span className="text-[10px] text-zinc-500 font-normal leading-tight">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* BMI card in calculator */}
          <div className={`p-4 rounded-lg border flex flex-col justify-between ${bmiCategory.color}`}>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold">
              <span>Estimated Body Mass Index</span>
              <Gauge className="w-4 h-4" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-bold font-mono tracking-tight">{currentBmi}</span>
              <span className="text-xs font-semibold">({bmiCategory.label})</span>
            </div>
            <p className="text-[10px] opacity-75 leading-tight mt-2 font-mono">
              Recommended Weight Range: {Math.round(18.5 * (height/100)*(height/100))}kg - {Math.round(24.9 * (height/100)*(height/100))}kg
            </p>
          </div>
        </div>

        {/* Right Area: Activities Table & Calculations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                24-Hour Active Activity Log Sheet
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                calculationResults.is24Hours ? "bg-emerald-950/20 text-emerald-400" : "bg-amber-950/20 text-amber-400"
              }`}>
                Sum: {calculationResults.totalMinutes} / 1440 min ({parseFloat((calculationResults.totalMinutes/60).toFixed(1))} hrs)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[450px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 pb-2">
                    <th className="pb-2">Activity Description</th>
                    <th className="pb-2 text-right w-[110px]">Duration (min)</th>
                    <th className="pb-2 text-right w-[140px]">Cost (kJ/kg/hour)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {activities.map((act, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1a1a]/40 transition-colors">
                      <td className="py-2.5 font-medium text-zinc-200">{act.name}</td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          value={act.durationMin}
                          onChange={(e) => handleDurationChange(idx, parseInt(e.target.value) || 0)}
                          className="w-16 bg-[#1a1a1a] border border-zinc-800 rounded px-1.5 py-1 text-right font-mono focus:outline-none focus:border-[#7c3aed] text-white"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={act.energyCostKjKgHr}
                          onChange={(e) => handleEnergyCostChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-[#1a1a1a] border border-zinc-800 rounded px-1.5 py-1 text-right font-mono focus:outline-none focus:border-[#7c3aed] text-purple-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!calculationResults.is24Hours && (
              <div className="p-3 bg-amber-950/10 border border-amber-900/30 rounded flex items-start space-x-2 text-[10px] text-amber-400 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Attention: Durations total is {calculationResults.totalMinutes} minutes. For a strict 24-hour metabolic scope, adjust "Relaxing/Leisure" until the sum reaches exactly 1440 minutes.
                </p>
              </div>
            )}
          </div>

          {/* Results Summary Board */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-4">
              Consolidated Daily Metabolic Load
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/40">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Basal Rate (BMR)</span>
                <span className="text-lg font-bold font-mono text-zinc-100">{calculationResults.bmrKcal}</span>
                <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">kcal/day</span>
              </div>

              <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/40">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Occupational Load</span>
                <span className="text-lg font-bold font-mono text-zinc-100">+{calculationResults.workKcal}</span>
                <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">kcal/day</span>
              </div>

              <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/40">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Physical Activities</span>
                <span className="text-lg font-bold font-mono text-purple-400">+{calculationResults.activityKcal}</span>
                <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">kcal/day</span>
              </div>

              <div className="p-3 bg-[#7c3aed]/10 rounded border border-[#7c3aed]/30">
                <span className="text-[9px] font-mono text-purple-300 block uppercase font-bold">TOTAL REQUIREMENT</span>
                <span className="text-xl font-bold font-mono text-white">{calculationResults.totalKcal}</span>
                <span className="text-[9px] font-mono text-purple-300 block mt-0.5">kcal/day</span>
              </div>
            </div>

            {/* Reduction / Gain controls */}
            <div className="space-y-4 pt-3 border-t border-zinc-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActivePlan(activePlan === "reduction" ? null : "reduction")}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                    activePlan === "reduction" 
                      ? "bg-rose-950/20 border-rose-500/40 text-rose-400" 
                      : "bg-zinc-900 hover:bg-zinc-800 border-transparent text-zinc-400"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Weight Reduction Guide</span>
                </button>

                <button
                  onClick={() => setActivePlan(activePlan === "gain" ? null : "gain")}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                    activePlan === "gain" 
                      ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400" 
                      : "bg-zinc-900 hover:bg-zinc-800 border-transparent text-zinc-400"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Weight Gain Guide</span>
                </button>
              </div>

              {activePlan === "reduction" && (
                <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-md space-y-2 animate-fade-in text-[11px]">
                  <span className="text-xs font-semibold text-rose-400 block uppercase font-mono">Weight Reduction Guidelines (Defisit Sehat)</span>
                  <p className="text-zinc-300 leading-relaxed">
                    • To lose weight safely, target a caloric deficit of <strong>500 kcal</strong> below total daily needs ({calculationResults.totalKcal - 500} kcal/day).
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    • Target macronutrient splits: High Protein (20-25% total kcal) to protect lean skeletal muscle, Moderate Carbs (40-45%), and Low Lipids (25-30%).
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    • Increase dietary fiber to &gt; 30g/day to promote satiety and reduce blood sugar spikes.
                  </p>
                </div>
              )}

              {activePlan === "gain" && (
                <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-md space-y-2 animate-fade-in text-[11px]">
                  <span className="text-xs font-semibold text-emerald-400 block uppercase font-mono">Weight Gain / Muscle Synthesis Guidelines</span>
                  <p className="text-zinc-300 leading-relaxed">
                    • To support clean muscle synthesis and healthy weight gain, aim for a surplus of <strong>300 - 500 kcal</strong> ({calculationResults.totalKcal + 400} kcal/day).
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    • Ensure protein intake is maintained at 1.6g - 2.2g per kg body weight ({Math.round(weight * 1.8)}g protein/day) to fuel protein translation.
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    • Include complex carbohydrates (Grains, Oats) to maintain glycogen stores and support anaerobic workouts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
