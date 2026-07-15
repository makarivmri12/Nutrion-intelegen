import React, { useEffect, useState } from "react";
import { useNutriStore } from "./store/useNutriStore";
import { AppTab } from "./types";
import Sidebar from "./components/Sidebar";
import SpreadsheetTab from "./components/SpreadsheetTab";
import PatientProfileTab from "./components/PatientProfileTab";
import AIIntelligenceTab from "./components/AIIntelligenceTab";
import FoodDatabaseTab from "./components/FoodDatabaseTab";
import AnalyticsTabs from "./components/dashboard/AnalyticsTabs";
import FFQTabs from "./components/ffq/FFQTabs";
import DietOptimizer from "./components/optimization/DietOptimizer";
import ReportGenerator from "./components/reports/ReportGenerator";
import RightInspector from "./components/RightInspector";
import StatusBar from "./components/StatusBar";

// Phase 5 & 6 Integrated Modular Components:
// - GrowthChart (WHO Growth Curve / KMS) is rendered within AnalyticsTabs (under the "WHO Growth Curve (KMS)" sub-tab for pediatric patients)
// - MedicationTracker is rendered within PatientProfileTab (for tracking patient drug-nutrient interactions)
// - FoodExchangeList (Bahan Penukar) is rendered within FoodDatabaseTab
import SettingsPanel from "./components/settings/SettingsPanel";
import HelpSystem from "./components/help/HelpSystem";
import CommandPalette from "./components/common/CommandPalette";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { collectAllData, createBackupFile, getStoredSettings } from "./services/syncService";
import BetaBanner from "./components/BetaBanner";
import HealthDisclaimer from "./components/HealthDisclaimer";

// Onboarding steps data
const ONBOARDING_STEPS = [
  {
    title: "Selamat Datang di Nutri-Intelligence!",
    text: "Platform asisten gizi cerdas terpadu untuk pencatatan gizi harian, analisis klinis, dan optimalisasi terapi gizi berbasis AI.",
    targetId: "sidebar-panel"
  },
  {
    title: "Spreadsheet Log Makanan",
    text: "Gunakan spreadsheet interaktif ini untuk mencatat log asupan makanan pasien per hari dengan porsi presisi.",
    targetId: "nav-spreadsheet"
  },
  {
    title: "Profil Medis & BMR",
    text: "Hitung secara instan Basal Metabolic Rate (BMR) dan Total Daily Energy Expenditure (TDEE) dengan formula terstandarisasi.",
    targetId: "nav-patient"
  },
  {
    title: "Visualisasi Clinical Analytics",
    text: "Pantau tren serapan gizi makro dan mikro pasien terhadap acuan angka kecukupan gizi klinis.",
    targetId: "nav-analytics"
  },
  {
    title: "LP Diet Optimizer",
    text: "Gunakan algoritma Linear Programming Simplex untuk menyelesaikan proporsi porsi optimal makanan dengan target kalori presisi.",
    targetId: "nav-optimizer"
  },
  {
    title: "AI Diagnostic Engine",
    text: "Analisis secara otomatis defisit mikronutrien pasien Anda dan buat rancangan intervensi gizi otomatis menggunakan Gemini.",
    targetId: "nav-ai"
  }
];

export default function App() {
  const { currentTab, setTab, loadFromLocalStorage, createNewProject } = useNutriStore();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Load baseline projects and settings on mount
  useEffect(() => {
    loadFromLocalStorage();

    // Load custom settings (font size)
    const settings = getStoredSettings();
    if (settings && settings.fontSize) {
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
    }
  }, [loadFromLocalStorage]);

  // Phase 5: 30-Second Auto-save system
  useEffect(() => {
    const runAutosave = () => {
      try {
        const settings = getStoredSettings();
        if (settings.autoSave !== false) {
          const data = collectAllData();
          createBackupFile(data)
            .then((success) => {
              if (success) {
                console.log("Nutri-Intelligence Autosave triggered to IndexedDB.");
              }
            })
            .catch((e) => {
              console.warn("Autosave promise rejected:", e);
            });
        }
      } catch (e) {
        console.warn("Autosave preparation error:", e);
      }
    };

    const interval = setInterval(runAutosave, 30000);

    return () => clearInterval(interval);
  }, []);

  // Phase 5: Keyboard Shortcuts Global Hook
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      action: () => setIsCommandPaletteOpen(true),
      description: "Membuka Command Palette"
    },
    {
      key: "m",
      ctrl: true,
      action: () => {
        const name = prompt("Masukkan nama lengkap pasien:");
        if (name) {
          createNewProject(`${name} - Diet Baru`, name);
        }
      },
      description: "Membuat File Pasien Baru"
    },
    {
      key: "p",
      ctrl: true,
      action: () => setTab(AppTab.SPREADSHEET),
      description: "Navigasi ke Spreadsheet"
    },
    {
      key: "F1",
      action: () => setTab(AppTab.HELP),
      description: "Buka Dokumentasi Bantuan"
    }
  ]);

  const handleStartTour = () => {
    setTab(AppTab.SPREADSHEET);
    setTourStep(0);
    setTourActive(true);
  };

  const handleNextTourStep = () => {
    if (tourStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      
      // Auto-navigate to show target panel if relevant
      if (nextStep === 1) setTab(AppTab.SPREADSHEET);
      else if (nextStep === 2) setTab(AppTab.PATIENT_PROFILE);
      else if (nextStep === 3) setTab(AppTab.ANALYTICS);
      else if (nextStep === 4) setTab(AppTab.OPTIMIZER);
      else if (nextStep === 5) setTab(AppTab.AI_INTELLIGENCE);
    } else {
      setTourActive(false);
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case AppTab.SPREADSHEET:
        return <SpreadsheetTab />;
      case AppTab.PATIENT_PROFILE:
        return <PatientProfileTab />;
      case AppTab.AI_INTELLIGENCE:
        return <AIIntelligenceTab />;
      case AppTab.FOOD_DATABASE:
        return <FoodDatabaseTab />;
      case AppTab.ANALYTICS:
        return <AnalyticsTabs />;
      case AppTab.FFQ_DIET:
        return <FFQTabs />;
      case AppTab.OPTIMIZER:
        return <DietOptimizer />;
      case AppTab.REPORTS:
        return <ReportGenerator />;
      case AppTab.SETTINGS:
        return <SettingsPanel />;
      case AppTab.HELP:
        return <HelpSystem onStartTour={handleStartTour} />;
      default:
        return <SpreadsheetTab />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <BetaBanner />
      <HealthDisclaimer />
      {/* 3-Pane Main Grid Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Navigation & Patient Files Directory */}
        <Sidebar />

        {/* Center Space: Main Spreadsheet and workspace tabs */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]" id="center-workspace-panel">
          {renderActiveTab()}
        </div>

        {/* Right Side: Total Telemetry and charts inspector */}
        <RightInspector />
      </div>

      {/* Bottom Status Indicators Bar */}
      <StatusBar />

      {/* Global Command Palette search */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      {/* Onboarding Interactive Tour Overlay */}
      {tourActive && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none z-[110] flex items-end justify-center md:items-center p-6">
          <div className="pointer-events-auto bg-[#121212] border border-[#00d4ff]/40 rounded-xl max-w-sm w-full p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                Panduan Tur ({tourStep + 1} / {ONBOARDING_STEPS.length})
              </span>
              <button 
                onClick={() => setTourActive(false)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                Lewati
              </button>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{ONBOARDING_STEPS[tourStep].title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{ONBOARDING_STEPS[tourStep].text}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-1">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all ${i === tourStep ? "w-4 bg-[#00d4ff]" : "w-1.5 bg-zinc-800"}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextTourStep}
                className="bg-[#00d4ff] hover:bg-[#00b4df] text-black text-xs font-semibold px-4 py-1.5 rounded transition-colors"
              >
                {tourStep === ONBOARDING_STEPS.length - 1 ? "Selesai" : "Lanjut"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
