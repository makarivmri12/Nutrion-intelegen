import React, { useState } from "react";
import { useNutriStore } from "../store/useNutriStore";
import { AppTab } from "../types";
import { 
  FileText, 
  Users, 
  Database, 
  Brain, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Sparkles,
  Layers,
  Heart,
  LineChart,
  ClipboardList,
  Cpu,
  Printer,
  Settings,
  HelpCircle
} from "lucide-react";

export default function Sidebar() {
  const { 
    projects, 
    currentProjectId, 
    currentTab, 
    setTab, 
    createNewProject, 
    deleteProject, 
    selectProject,
    importSampleProject 
  } = useNutriStore();

  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newPatientName, setNewPatientName] = useState("");

  const handleCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    createNewProject(newProjName, newPatientName || undefined);
    setNewProjName("");
    setNewPatientName("");
    setShowNewProjModal(false);
  };

  const activeProject = projects.find((p) => p.id === currentProjectId);

  return (
    <div className="w-[260px] bg-[#121212] border-r border-[#27272a] flex flex-col h-full select-none" id="sidebar-panel">
      {/* Platform Branding */}
      <div className="p-4 border-b border-[#27272a] flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff]">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-white uppercase">
            Nutri-Intelligence
          </h1>
          <p className="text-[10px] text-[#a1a1aa] font-mono tracking-tight">
            CLINICAL DESKTOP v2.4
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="p-3 space-y-1 overflow-y-auto max-h-[350px] scrollbar-thin">
        <button
          onClick={() => setTab(AppTab.SPREADSHEET)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.SPREADSHEET
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-spreadsheet"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#00d4ff]" />
          <span>Spreadsheet Gizi</span>
        </button>

        <button
          onClick={() => setTab(AppTab.PATIENT_PROFILE)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.PATIENT_PROFILE
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-patient"
        >
          <Users className="w-4 h-4 text-[#7c3aed]" />
          <span>Profil Pasien & BMR</span>
        </button>

        <button
          onClick={() => setTab(AppTab.ANALYTICS)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.ANALYTICS
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-analytics"
        >
          <LineChart className="w-4 h-4 text-[#00d4ff]" />
          <span>Analisis Klinis</span>
        </button>

        <button
          onClick={() => setTab(AppTab.FFQ_DIET)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.FFQ_DIET
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-ffq"
        >
          <ClipboardList className="w-4 h-4 text-[#7c3aed]" />
          <span>Riwayat Diet FFQ</span>
        </button>

        <button
          onClick={() => setTab(AppTab.OPTIMIZER)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.OPTIMIZER
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-optimizer"
        >
          <Cpu className="w-4 h-4 text-amber-500 animate-spin-slow" />
          <span>Optimasi Diet LP</span>
        </button>

        <button
          onClick={() => setTab(AppTab.REPORTS)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.REPORTS
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-reports"
        >
          <Printer className="w-4 h-4 text-pink-500" />
          <span>Laporan Asesmen</span>
        </button>

        <button
          onClick={() => setTab(AppTab.AI_INTELLIGENCE)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.AI_INTELLIGENCE
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-ai"
        >
          <Brain className="w-4 h-4 text-pink-500 animate-pulse" />
          <div className="flex items-center justify-between w-full">
            <span>Mesin Diagnosis AI</span>
            <span className="text-[9px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
              Gemini
            </span>
          </div>
        </button>

        <button
          onClick={() => setTab(AppTab.FOOD_DATABASE)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.FOOD_DATABASE
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-foods"
        >
          <Database className="w-4 h-4 text-[#10b981]" />
          <span>Kamus Bahan Pangan</span>
        </button>

        <button
          onClick={() => setTab(AppTab.SETTINGS)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.SETTINGS
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-settings"
        >
          <Settings className="w-4 h-4 text-[#00d4ff]" />
          <span>Preferensi & Sistem</span>
        </button>

        <button
          onClick={() => setTab(AppTab.HELP)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
            currentTab === AppTab.HELP
              ? "bg-[#242424] text-white shadow-sm border-l-2 border-[#00d4ff]"
              : "text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          id="nav-help"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Pusat Bantuan (F1)</span>
        </button>
      </div>

      {/* Projects and Patients Files Section */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-[#27272a] mt-2">
        <div className="p-3 flex items-center justify-between text-[11px] font-mono tracking-wider text-[#a1a1aa] uppercase font-semibold">
          <span>Patient Records</span>
          <button
            onClick={() => setShowNewProjModal(true)}
            className="p-1 hover:bg-[#242424] rounded text-white transition-colors"
            title="Create New Patient File"
            id="add-patient-file-btn"
          >
            <Plus className="w-4 h-4 text-[#00d4ff]" />
          </button>
        </div>

        {/* Project Files List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-3 scrollbar-thin">
          {projects.map((proj) => {
            const isActive = proj.id === currentProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => selectProject(proj.id)}
                className={`group flex items-center justify-between p-2 rounded cursor-pointer text-xs transition-all ${
                  isActive
                    ? "bg-[#1a1a1a] text-white border-l-2 border-[#00d4ff]"
                    : "text-[#a1a1aa] hover:bg-[#121212] hover:text-white"
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-medium truncate text-[11.5px]">{proj.name}</span>
                  <span className="text-[10px] text-zinc-500 truncate font-mono">
                    {proj.patientProfile.gender}, {proj.patientProfile.age}y • {proj.foodLogs.length} logs
                  </span>
                </div>
                {projects.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Yakin ingin menghapus record ${proj.name}?`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-opacity"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Power-User Helpers / Import Templates */}
        <div className="p-3 border-t border-[#27272a] bg-[#0d0d0d] space-y-2">
          <div className="text-[10px] text-zinc-500 font-mono tracking-wide">
            POWER TOOLS
          </div>
          <button
            onClick={importSampleProject}
            className="w-full text-left py-1.5 px-2 bg-[#1a1a1a] hover:bg-[#242424] border border-[#27272a] rounded text-[11px] text-zinc-300 font-medium flex items-center space-x-1.5 transition-colors"
            id="import-sample-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample: Diabetes Case</span>
          </button>
        </div>
      </div>

      {/* New Project / Patient File Inline Modal Dialog */}
      {showNewProjModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg max-w-sm w-full p-5 shadow-2xl animate-fade-in">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-[#00d4ff]" />
              <span>Buat File Pasien Baru</span>
            </h3>
            <form onSubmit={handleCreateProj} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Nama File / Project
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso - Diet Hipertensi"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  Nama Lengkap Pasien
                </label>
                <input
                  type="text"
                  placeholder="e.g. Budi Santoso"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-[#00d4ff] hover:bg-[#00b4df] text-xs text-black font-semibold transition-colors"
                >
                  Buat Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
