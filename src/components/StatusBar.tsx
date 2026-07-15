import React from "react";
import { useNutriStore } from "../store/useNutriStore";
import { Database, ShieldCheck, Cpu, RefreshCw } from "lucide-react";

export default function StatusBar() {
  const { isSaving, currentProjectId } = useNutriStore();

  return (
    <div className="h-6 bg-[#0a0a0a] border-t border-[#27272a] px-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none">
      {/* Left side */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <Database className="w-3 h-3 text-[#10b981]" />
          <span className="text-[#10b981]">SQLite Sandboxed State</span>
        </div>
        <span>•</span>
        <span>ID: {currentProjectId || "None"}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {isSaving ? (
          <div className="flex items-center space-x-1 text-amber-400">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Auto-saving changes...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-zinc-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>State synchronized with browser IndexedDB</span>
          </div>
        )}
        <span>•</span>
        <div className="flex items-center space-x-1">
          <Cpu className="w-3 h-3" />
          <span>Gemini-3.5-Flash Active</span>
        </div>
      </div>
    </div>
  );
}
