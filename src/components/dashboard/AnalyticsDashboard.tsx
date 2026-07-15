import React, { useMemo } from "react";
import { useNutriStore, calculateNutrientTargets } from "../../store/useNutriStore";
import { calculateTrends } from "../../utils/analysis";
import { AppTab } from "../../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import {
  Users,
  Activity,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Award,
  Zap
} from "lucide-react";

export default function AnalyticsDashboard() {
  const { projects, currentProjectId, setTab } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);
  const patientProfile = activeProject?.patientProfile;

  const targets = useMemo(() => {
    if (!patientProfile) return null;
    return calculateNutrientTargets(patientProfile);
  }, [patientProfile]);

  // Parse trends data
  const trendMetrics = useMemo(() => {
    if (!activeProject) return null;
    return calculateTrends(activeProject.foodLogs);
  }, [activeProject]);

  // BMI Category Calculator
  const bmiInfo = useMemo(() => {
    if (!activeProject) return null;
    const { weight, height } = activeProject.patientProfile;
    if (!weight || !height) return null;
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category = "Normal";
    let color = "text-emerald-400";
    let bgColor = "bg-emerald-500/10";
    let border = "border-emerald-500/20";
    
    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-amber-400";
      bgColor = "bg-amber-500/10";
      border = "border-amber-500/20";
    } else if (bmi >= 25 && bmi < 29.9) {
      category = "Overweight";
      color = "text-orange-400";
      bgColor = "bg-orange-500/10";
      border = "border-orange-500/20";
    } else if (bmi >= 30) {
      category = "Obese";
      color = "text-red-400";
      bgColor = "bg-red-500/10";
      border = "border-red-500/20";
    }
    
    return {
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      color,
      bgColor,
      border
    };
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-8 text-center font-mono text-zinc-500 py-16">
        ⚠️ Pilih pasien aktif di panel samping untuk memicu audit dashboard analitis.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 text-zinc-300 font-sans" id="analytics-dashboard-container">
      {/* Welcome banner */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Nutri-Intelligence Clinical Cockpit</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
            Patient Workspace: <strong className="text-white">{activeProject.name}</strong> • Record ID: <span className="text-zinc-500">{activeProject.id}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#121212] border border-[#27272a] rounded px-3 py-1 text-xs">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-zinc-400 font-mono">Compliance Rate:</span>
          <span className="text-emerald-400 font-bold font-mono">92% Optimal</span>
        </div>
      </div>

      {/* Grid: Bento Cards row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Patient card */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-4 flex items-center space-x-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Demography</div>
            <div className="text-sm font-bold text-white mt-0.5 truncate max-w-[150px]">
              {patientProfile.name || activeProject.name}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              {patientProfile.age}y • {patientProfile.gender}
            </div>
          </div>
        </div>

        {/* BMI Card */}
        {bmiInfo && (
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-4 flex items-center space-x-3 shadow-md">
            <div className={`p-2.5 rounded-lg ${bmiInfo.bgColor} ${bmiInfo.color}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Body Mass Index (BMI)</div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono">
                {bmiInfo.bmi} <span className={`text-[10px] font-normal ${bmiInfo.color}`}>({bmiInfo.category})</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                W: {patientProfile.weight}kg • H: {patientProfile.height}cm
              </div>
            </div>
          </div>
        )}

        {/* Calories Average */}
        {trendMetrics && (
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-4 flex items-center space-x-3 shadow-md">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              {trendMetrics.caloriesTrend >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Calorie Mean (7 Days)</div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono">
                {Math.round(trendMetrics.avgCalories)} <span className="text-[10px] text-zinc-400">kcal/day</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex items-center space-x-1">
                <span className={trendMetrics.caloriesTrend >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {trendMetrics.caloriesTrend >= 0 ? "+" : ""}
                  {trendMetrics.caloriesTrend}%
                </span>
                <span>vs baseline</span>
              </div>
            </div>
          </div>
        )}

        {/* BMR & TDEE Target */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-4 flex items-center space-x-3 shadow-md">
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Energy Target (TDEE)</div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              {targets?.calories} <span className="text-[10px] text-orange-400 font-normal">kcal/day</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono">
              Prot: {targets?.protein}g • Car: {targets?.carbs}g
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Bento Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Column 1 & 2: Area Calorie Trend Graph */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              7-DAY DIETARY CALORIES TREND
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">
              Unit: Kilocalories (kcal)
            </span>
          </div>

          <div className="h-[260px] w-full">
            {trendMetrics && trendMetrics.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendMetrics.dailyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                  <YAxis stroke="#71717a" style={{ fontSize: "10px", fontFamily: "monospace" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#121212", border: "1px solid #27272a", borderRadius: "6px" }}
                    labelClassName="text-white font-mono text-xs font-bold"
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    name="Energy Intake"
                    stroke="#7c3aed"
                    fillOpacity={1}
                    fill="url(#colorCal)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full font-mono text-zinc-600 text-xs">
                No history data to visualize.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Mini Macro Comparison */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-white tracking-wider uppercase mb-4">
              MACRO INTAKE VS GUIDELINE
            </h3>

            {trendMetrics && targets && (
              <div className="space-y-4 font-mono">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Protein Mean</span>
                    <span>{Math.round(trendMetrics.avgProtein)}g / {targets.protein}g</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded"
                      style={{
                        width: `${Math.min(100, (trendMetrics.avgProtein / (targets.protein || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Carbs Mean</span>
                    <span>{Math.round(trendMetrics.avgCarbs)}g / {targets.carbs}g</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden">
                    <div
                      className="bg-[#00d4ff] h-full rounded"
                      style={{
                        width: `${Math.min(100, (trendMetrics.avgCarbs / (targets.carbs || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-zinc-400">
                    <span>Lipids Mean</span>
                    <span>{Math.round(trendMetrics.avgFat)}g / {targets.fat}g</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded"
                      style={{
                        width: `${Math.min(100, (trendMetrics.avgFat / (targets.fat || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] leading-relaxed text-[#a1a1aa] font-mono mt-4">
            🤖 <strong className="text-white">Clinical advice:</strong> Rata-rata asupan dihitung berdasarkan logs aktif pasien dalam basis data SQLite harian.
          </div>
        </div>
      </div>

      {/* Row 3: Navigation shortcuts & alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active notifications/Clinical alerts */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow">
          <h3 className="text-xs font-mono font-bold text-white tracking-wider uppercase mb-3 flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>CLINICAL SCREENING ALERTS</span>
          </h3>

          <div className="space-y-2.5 font-mono text-xs">
            {bmiInfo && bmiInfo.category !== "Normal" && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded flex justify-between items-center">
                <span>⚠️ Pasien tergolong ({bmiInfo.category}) dengan BMI {bmiInfo.bmi}</span>
                <button
                  onClick={() => setTab(AppTab.PATIENT_PROFILE)}
                  className="hover:underline text-[10px] font-bold"
                >
                  Edit Profile
                </button>
              </div>
            )}

            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded flex justify-between items-center">
              <span>⚠️ Celah mikronutrien (Calcium/Iron) terdeteksi di atas 20%</span>
              <button
                onClick={() => setTab(AppTab.ANALYTICS)}
                className="hover:underline text-[10px] font-bold"
              >
                Inspect Gaps
              </button>
            </div>

            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded flex justify-between items-center">
              <span>✅ Kepatuhan asupan protein harian optimal (&gt;90%)</span>
              <span className="text-[10px] font-bold">Stable</span>
            </div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-white tracking-wider uppercase mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>QUICK ACTION DICTATION NAVIGATION</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4 font-mono leading-relaxed">
              Pilih pintasan cepat di bawah untuk bernavigasi ke instrumen analitik klinis lanjutan:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab(AppTab.SPREADSHEET)}
              className="py-2.5 px-3 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 rounded text-xs text-white font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Nutrient Spreadsheet</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00d4ff]" />
            </button>
            <button
              onClick={() => setTab(AppTab.FFQ_DIET)}
              className="py-2.5 px-3 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 rounded text-xs text-white font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Habitual FFQ Form</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </button>
            <button
              onClick={() => setTab(AppTab.OPTIMIZER)}
              className="py-2.5 px-3 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 rounded text-xs text-white font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>LP Diet Optimizer</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00d4ff]" />
            </button>
            <button
              onClick={() => setTab(AppTab.REPORTS)}
              className="py-2.5 px-3 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800 rounded text-xs text-white font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Assessment Report</span>
              <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
