import React, { useState, useEffect } from "react";
import { useNutriStore, calculateNutrientTargets } from "../../store/useNutriStore";
import AnalyticsDashboard from "./AnalyticsDashboard";
import NutritionCharts from "../charts/NutritionCharts";
import DeficitAnalysis from "../analysis/DeficitAnalysis";
import GrowthChart from "../pediatric/GrowthChart";
import { LayoutDashboard, BarChart3, AlertTriangle, Baby } from "lucide-react";

export default function AnalyticsTabs() {
  const { projects, currentProjectId } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "charts" | "gaps" | "growth">("dashboard");

  useEffect(() => {
    if (!activeProject) return;
    const age = activeProject.patientProfile.age;
    const isPediatricWHO = age <= 5;
    
    if (activeSubTab === "growth" && !isPediatricWHO) {
      setActiveSubTab("dashboard");
    }
  }, [activeProject, activeSubTab]);

  if (!activeProject) {
    return (
      <div className="bg-[#0a0a0a] flex-1 flex items-center justify-center font-mono text-zinc-500 text-xs">
        ⚠️ Pilih pasien aktif di panel samping untuk memicu audit dashboard analitis.
      </div>
    );
  }

  const targets = calculateNutrientTargets(activeProject.patientProfile);
  const age = activeProject.patientProfile.age;
  const isPediatricWHO = age <= 5;

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Sub Navigation header */}
      <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSubTab("dashboard")}
            className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === "dashboard"
                ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive Cockpit</span>
          </button>

          <button
            onClick={() => setActiveSubTab("charts")}
            className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === "charts"
                ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Intelligent Recharts</span>
          </button>

          <button
            onClick={() => setActiveSubTab("gaps")}
            className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === "gaps"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Gaps & Remedies</span>
          </button>

          {isPediatricWHO && (
            <button
              onClick={() => setActiveSubTab("growth")}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
                activeSubTab === "growth"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                  : "text-zinc-400 hover:text-white"
              } animate-pulse`}
            >
              <Baby className="w-4 h-4" />
              <span>WHO Growth Curve (KMS)</span>
            </button>
          )}
        </div>

        <div className="text-[10px] font-mono text-zinc-500">
          ANALYSIS MODE: CLINICAL ACTIVE
        </div>
      </div>

      {/* Workspace panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeSubTab === "dashboard" && <AnalyticsDashboard />}
        {activeSubTab === "charts" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
            <NutritionCharts
              logs={activeProject.foodLogs}
              targets={targets}
            />
          </div>
        )}
        {activeSubTab === "gaps" && <DeficitAnalysis />}
        {activeSubTab === "growth" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
            <GrowthChart />
          </div>
        )}
      </div>
    </div>
  );
}
