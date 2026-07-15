import React, { useState } from "react";
import FoodFrequencyForm from "./FoodFrequencyForm";
import DietHistory from "./DietHistory";
import { ClipboardList, CalendarDays } from "lucide-react";

export default function FFQTabs() {
  const [activeSubTab, setActiveSubTab] = useState<"ffq" | "history">("ffq");

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Sub Navigation bar */}
      <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex items-center space-x-4">
        <button
          onClick={() => setActiveSubTab("ffq")}
          className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === "ffq"
              ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Food Frequency Questionnaire (FFQ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-3 py-1.5 rounded text-xs font-semibold font-mono flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === "history"
              ? "bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/30"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Diet History Assessment (1-3 Mo)</span>
        </button>
      </div>

      {/* Render sub-tab */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeSubTab === "ffq" ? <FoodFrequencyForm /> : <DietHistory />}
      </div>
    </div>
  );
}
