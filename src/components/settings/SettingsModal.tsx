import React, { useState, useEffect } from "react";
import { 
  Settings, 
  X, 
  Palette, 
  Database, 
  Sliders, 
  Keyboard, 
  Save, 
  Check 
} from "lucide-react";
import { useNutriStore } from "../../store/useNutriStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { selectedDatabaseSource, setSelectedDatabaseSource } = useNutriStore();

  // Load custom goals from localStorage or use defaults
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(75);
  const [targetCarbs, setTargetCarbs] = useState(250);
  const [targetFat, setTargetFat] = useState(65);
  const [targetFiber, setTargetFiber] = useState(30);
  
  // Custom prioritizing source
  const [dbOrder, setDbOrder] = useState<string>("BLS");

  // Accent theme
  const [accentTheme, setAccentTheme] = useState<"cyan" | "purple" | "green">("cyan");

  // Shortcuts toggler
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  // Saved success message
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load initially
  useEffect(() => {
    const savedCal = localStorage.getItem("setting_target_calories");
    const savedP = localStorage.getItem("setting_target_protein");
    const savedC = localStorage.getItem("setting_target_carbs");
    const savedF = localStorage.getItem("setting_target_fat");
    const savedFb = localStorage.getItem("setting_target_fiber");
    const savedAccent = localStorage.getItem("setting_accent_theme");
    const savedShortcuts = localStorage.getItem("setting_shortcuts_enabled");

    if (savedCal) setTargetCalories(Number(savedCal));
    if (savedP) setTargetProtein(Number(savedP));
    if (savedC) setTargetCarbs(Number(savedC));
    if (savedF) setTargetFat(Number(savedF));
    if (savedFb) setTargetFiber(Number(savedFb));
    if (savedAccent) setAccentTheme(savedAccent as any);
    if (savedShortcuts) setShortcutsEnabled(savedShortcuts === "true");
    
    setDbOrder(selectedDatabaseSource);
  }, [selectedDatabaseSource, isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    localStorage.setItem("setting_target_calories", String(targetCalories));
    localStorage.setItem("setting_target_protein", String(targetProtein));
    localStorage.setItem("setting_target_carbs", String(targetCarbs));
    localStorage.setItem("setting_target_fat", String(targetFat));
    localStorage.setItem("setting_target_fiber", String(targetFiber));
    localStorage.setItem("setting_accent_theme", accentTheme);
    localStorage.setItem("setting_shortcuts_enabled", String(shortcutsEnabled));
    
    setSelectedDatabaseSource(dbOrder);

    // Apply color theme dynamically
    if (accentTheme === "cyan") {
      document.documentElement.style.setProperty("--color-accent", "#00d4ff");
    } else if (accentTheme === "purple") {
      document.documentElement.style.setProperty("--color-accent", "#7c3aed");
    } else {
      document.documentElement.style.setProperty("--color-accent", "#10b981");
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#121212] border border-[#27272a] rounded-lg w-full max-w-xl shadow-2xl overflow-hidden text-zinc-300 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-zinc-900/60">
          <div className="flex items-center space-x-2 text-white font-mono uppercase text-xs font-bold">
            <Settings className="w-4 h-4 text-[#00d4ff]" />
            <span>Preferences & Nutritional Goals</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Accent customization */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>UI Accent Theme Identity</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "cyan", label: "Classic Cyan", color: "bg-[#00d4ff]" },
                { key: "purple", label: "Royal Purple", color: "bg-[#7c3aed]" },
                { key: "green", label: "Clinical Emerald", color: "bg-[#10b981]" },
              ].map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => setAccentTheme(theme.key as any)}
                  className={`p-2.5 rounded border text-xs font-mono font-medium flex items-center space-x-2 transition-all cursor-pointer ${
                    accentTheme === theme.key 
                      ? "bg-zinc-900 border-[#00d4ff] text-white" 
                      : "bg-[#1a1a1a] border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme.color} shrink-0`} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines Customize */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Custom RDA / DRI Reference Targets</span>
            </span>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Math.max(1, parseInt(e.target.value) || 2000))}
                  className="w-full bg-[#1a1a1a] border border-zinc-850 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Math.max(1, parseInt(e.target.value) || 75))}
                  className="w-full bg-[#1a1a1a] border border-zinc-850 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Carbohydrates (g)</label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(Math.max(1, parseInt(e.target.value) || 250))}
                  className="w-full bg-[#1a1a1a] border border-zinc-850 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={(e) => setTargetFat(Math.max(1, parseInt(e.target.value) || 65))}
                  className="w-full bg-[#1a1a1a] border border-zinc-850 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Fiber (g)</label>
                <input
                  type="number"
                  value={targetFiber}
                  onChange={(e) => setTargetFiber(Math.max(1, parseInt(e.target.value) || 30))}
                  className="w-full bg-[#1a1a1a] border border-zinc-850 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>
          </div>

          {/* Database source priority */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>Prioritize Database Source</span>
            </span>

            <select
              value={dbOrder}
              onChange={(e) => setDbOrder(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer"
            >
              <option value="ALL">ALL DB (Merge and search overall databases)</option>
              <option value="BLS">German BLS Database (11,000+ items)</option>
              <option value="USDA">USDA SR28 (Standard US Database)</option>
              <option value="INDONESIAN">Indonesian Food Database (Health Polytechnic Padang)</option>
              <option value="FAO">FAO-Minilist (200 most important worldwide)</option>
            </select>
          </div>

          {/* Keyboard Shortcuts Guidelines info */}
          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
              <Keyboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Power-User Keyboard Shortcuts</span>
            </span>

            <div className="p-3 bg-zinc-950/40 rounded border border-zinc-800/40 space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Close Modals / Cancel</span>
                <span className="text-[#00d4ff] font-semibold">ESC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Save Active Records</span>
                <span className="text-[#00d4ff] font-semibold">CTRL + S</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Add New Custom Ingredient</span>
                <span className="text-[#00d4ff] font-semibold">ALT + N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Trigger Clinical Report PDF</span>
                <span className="text-[#00d4ff] font-semibold">ALT + E</span>
              </div>
            </div>

            <label className="flex items-center space-x-2 text-xs cursor-pointer text-zinc-400 hover:text-white pt-1">
              <input
                type="checkbox"
                checked={shortcutsEnabled}
                onChange={(e) => setShortcutsEnabled(e.target.checked)}
                className="rounded text-[#00d4ff] bg-zinc-900 border-zinc-800 focus:ring-0 cursor-pointer"
              />
              <span>Enable desktop-centric keyboard shortcut bindings</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-900/40 flex justify-end items-center space-x-3">
          {savedSuccess && (
            <span className="text-emerald-400 text-xs font-mono font-semibold flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Settings stored successfully!</span>
            </span>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-5 py-2 bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-xs rounded flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Apply & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
