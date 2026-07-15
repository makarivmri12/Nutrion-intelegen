import React, { useState } from "react";
import { useNutriStore } from "../store/useNutriStore";
import { 
  User, 
  Activity, 
  Calculator, 
  TrendingUp, 
  Heart, 
  HelpCircle,
  FileText,
  Info,
  Layers,
  Zap,
  Users
} from "lucide-react";
import PatientManager from "./patient/PatientManager";
import EnergyCalculator from "./calculators/EnergyCalculator";
import MedicationTracker from "./patient/MedicationTracker";

export default function PatientProfileTab() {
  const { projects, currentProjectId, updatePatientProfile } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);

  const [subTab, setSubTab] = useState<"demographics" | "registry" | "calculator">("demographics");

  if (subTab === "registry") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        {/* Sub-tab Bar */}
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button
            onClick={() => setSubTab("demographics")}
            className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer"
          >
            Baseline Demographics
          </button>
          <button
            onClick={() => setSubTab("registry")}
            className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer"
          >
            Clinical Registry
          </button>
          <button
            onClick={() => setSubTab("calculator")}
            className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer"
          >
            Physical Energy Cost
          </button>
        </div>
        <PatientManager />
      </div>
    );
  }

  if (subTab === "calculator") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        {/* Sub-tab Bar */}
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button
            onClick={() => setSubTab("demographics")}
            className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer"
          >
            Baseline Demographics
          </button>
          <button
            onClick={() => setSubTab("registry")}
            className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer"
          >
            Clinical Registry
          </button>
          <button
            onClick={() => setSubTab("calculator")}
            className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer"
          >
            Physical Energy Cost
          </button>
        </div>
        <EnergyCalculator />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
        Select or create a patient file from the left sidebar to edit parameters.
      </div>
    );
  }

  const profile = activeProject.patientProfile;

  const handleFieldChange = (field: string, value: any) => {
    updatePatientProfile({ [field]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] flex flex-col min-h-0" id="patient-profile-container">
      {/* Sub-tab Bar */}
      <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
        <button
          onClick={() => setSubTab("demographics")}
          className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer"
        >
          Baseline Demographics
        </button>
        <button
          onClick={() => setSubTab("registry")}
          className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer"
        >
          Clinical Registry
        </button>
        <button
          onClick={() => setSubTab("calculator")}
          className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer"
        >
          Physical Energy Cost
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tab Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-wide text-white uppercase font-mono">
              Patient Physiological & Clinical Metrics
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Configure clinical characteristics to calculate real-time dietary requirements.
            </p>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Demographics Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white tracking-wider font-mono uppercase flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <User className="w-4 h-4 text-[#7c3aed]" />
              <span>Demographics & Baseline Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Patient Name / ID
                </label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  id="patient-name-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Gender
                </label>
                <select
                  value={profile.gender || "Male"}
                  onChange={(e) => handleFieldChange("gender", e.target.value as "Male" | "Female")}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                  id="patient-gender-field"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={profile.age ?? ""}
                  onChange={(e) => handleFieldChange("age", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                  id="patient-age-field"
                />
              </div>

              {profile.age <= 5 && (
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                    Age in Months (Pediatric 0-60m)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={profile.ageMonths !== undefined ? profile.ageMonths : (profile.age * 12)}
                      onChange={(e) => handleFieldChange("ageMonths", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-[#00d4ff] focus:outline-none focus:border-[#00d4ff] font-mono"
                    />
                    <span className="text-[10px] font-mono text-zinc-500">months</span>
                  </div>
                </div>
              )}

              {profile.gender === "Female" && (
                <div className="grid grid-cols-2 gap-3 col-span-2 bg-[#1a1a1a] p-3 rounded border border-zinc-800/80">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Pregnancy Status
                    </label>
                    <select
                      value={profile.pregnancyStatus || "none"}
                      onChange={(e) => handleFieldChange("pregnancyStatus", e.target.value)}
                      className="w-full bg-[#121212] border border-[#27272a] rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                    >
                      <option value="none">Not Pregnant</option>
                      <option value="trimester1">Trimester 1 (+180 kcal)</option>
                      <option value="trimester2">Trimester 2 (+300 kcal)</option>
                      <option value="trimester3">Trimester 3 (+300 kcal)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                      Lactation Status
                    </label>
                    <select
                      value={profile.lactationStatus || "none"}
                      onChange={(e) => handleFieldChange("lactationStatus", e.target.value)}
                      className="w-full bg-[#121212] border border-[#27272a] rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                    >
                      <option value="none">Not Lactating</option>
                      <option value="months0to6">Lactating 0-6m (+330 kcal)</option>
                      <option value="months7to12">Lactating 7-12m (+400 kcal)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Physical Activity Level (PAL)
                </label>
                <select
                  value={profile.activityLevel || "Sedentary"}
                  onChange={(e) => handleFieldChange("activityLevel", e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                  id="patient-activity-field"
                >
                  <option value="Sedentary">Sedentary (No Exercise, Desk Job)</option>
                  <option value="Lightly Active">Lightly Active (Light Sports 1-3 days/wk)</option>
                  <option value="Moderately Active">Moderately Active (Moderate Sports 3-5 days/wk)</option>
                  <option value="Very Active">Very Active (Heavy Sports 6-7 days/wk)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Height (cm)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={profile.height ?? ""}
                    onChange={(e) => handleFieldChange("height", Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                    id="patient-height-field"
                  />
                  <span className="text-xs text-zinc-500 font-mono">cm</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Body Weight (kg)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={profile.weight ?? ""}
                    onChange={(e) => handleFieldChange("weight", Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                    id="patient-weight-field"
                  />
                  <span className="text-xs text-zinc-500 font-mono">kg</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Clinical Pathology / Medical Targets
                </label>
                <input
                  type="text"
                  value={profile.conditions || ""}
                  onChange={(e) => handleFieldChange("conditions", e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, High Blood Pressure, Atherosclerosis, Kidney failure"
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  id="patient-conditions-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Dietitian Assessment Notes
                </label>
                <textarea
                  value={profile.notes || ""}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  rows={4}
                  placeholder="Enter dietitian diagnosis, family history, observations, or targeted nutrition plans here..."
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  id="patient-notes-field"
                />
              </div>
            </div>
          </div>

          {/* Medication Tracker integration for Phase 5.8 */}
          <div className="text-zinc-800">
            <MedicationTracker />
          </div>
        </div>

        {/* Calculated Results Inspector Card */}
        <div className="space-y-6">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-6">
            <h3 className="text-xs font-semibold text-white tracking-wider font-mono uppercase flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Calculator className="w-4 h-4 text-[#00d4ff]" />
              <span>Real-Time Clinical Calculations</span>
            </h3>

            {/* BMI Card */}
            <div className="bg-[#1a1a1a] rounded p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-zinc-500">BODY MASS INDEX (BMI)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  {profile.bmiCategory}
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white font-mono">{profile.bmi}</span>
                <span className="text-xs text-zinc-400 font-mono">kg/m²</span>
              </div>

              {/* BMI Progress bar */}
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: "18.5%" }} title="Underweight" />
                <div className="h-full bg-emerald-500" style={{ width: "35%" }} title="Normal" />
                <div className="h-full bg-yellow-500" style={{ width: "25%" }} title="Overweight" />
                <div className="h-full bg-red-500" style={{ width: "21.5%" }} title="Obese" />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-500 mt-1">
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
              </div>
            </div>

            {/* BMR Card */}
            <div className="bg-[#1a1a1a] rounded p-4 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 block mb-1">BASAL METABOLIC RATE (BMR)</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-purple-400 font-mono">{profile.bmr}</span>
                <span className="text-xs text-zinc-400 font-mono">kcal / day</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                Energi minimum yang diperlukan tubuh untuk menjaga fungsi organ vital saat beristirahat penuh.
              </p>
            </div>

            {/* TDEE Targets Card */}
            <div className="bg-[#1a1a1a] rounded p-4 border border-zinc-800">
              <div className="flex items-center space-x-1 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Daily Calorie Target (TDEE)</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-pink-400 font-mono">
                  {Math.round(profile.bmr * (profile.activityLevel === "Sedentary" ? 1.2 : profile.activityLevel === "Lightly Active" ? 1.375 : profile.activityLevel === "Moderately Active" ? 1.55 : 1.725)) || 2000}
                </span>
                <span className="text-xs text-zinc-400 font-mono">kcal / day</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                Kalori total yang dianjurkan berdasarkan tingkat aktivitas fisik harian (PAL multiplier) untuk kestabilan berat badan.
              </p>
            </div>
          </div>

          <div className="bg-[#121212] border border-zinc-800 rounded-lg p-4 text-[11px] text-zinc-500 font-mono flex items-start space-x-3 leading-relaxed">
            <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
            <div>
              <span className="text-zinc-300 font-semibold uppercase tracking-wider block mb-1">Dietitian Guideline</span>
              Platform akan memperbarui target makronutrisi dan mikronutrisi harian secara cerdas di panel sebelah kanan setelah parameter pasien diubah. Gunakan tab <strong>AI Diagnostic Engine</strong> untuk mengirimkan data ini ke Gemini guna mendapatkan peninjauan klinis lengkap.
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
