import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNutriStore } from "../store/useNutriStore";
import { FoodItem, FoodLogEntry } from "../types";
import { 
  Plus, 
  Trash2, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Info, 
  HelpCircle,
  FileDown,
  Clipboard,
  Layers,
  CheckCircle,
  Minimize2,
  Settings,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { exportService } from "../services/exportService";
import SettingsModal from "./settings/SettingsModal";

export default function SpreadsheetTab() {
  const { 
    projects, 
    currentProjectId, 
    foodDatabase, 
    addFoodLogEntry, 
    updateFoodLogEntryWeight, 
    removeFoodLogEntry, 
    clearFoodLogs,
    updateFoodLogEntryCookingMethod
  } = useNutriStore();

  const activeProject = projects.find((p) => p.id === currentProjectId);
  const logs = activeProject ? activeProject.foodLogs : [];

  // Grid Keyboard Focus State
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);

  // Search & Auto-Suggest State
  const [searchQuery, setSearchQuery] = useState("");
  const [weightGrams, setWeightGrams] = useState<number>(100);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  
  // Modals / Dropdowns
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showMultiplierModal, setShowMultiplierModal] = useState(false);
  const [multiplierValue, setMultiplierValue] = useState<number>(1.0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Filter foods based on query & synonyms
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return foodDatabase.filter(food => 
      food.name.toLowerCase().includes(query) ||
      food.category.toLowerCase().includes(query) ||
      (food.synonyms && food.synonyms.toLowerCase().includes(query)) ||
      (food.code && food.code.toLowerCase().includes(query))
    ).slice(0, 10); // Top 10 matches
  }, [searchQuery, foodDatabase]);

  // Handle adding a selected food item
  const handleAddFood = (food: FoodItem, weight: number = 100, portionName?: string) => {
    addFoodLogEntry(food, weight, portionName);
    setSearchQuery("");
    setWeightGrams(100);
    setIsSuggestOpen(false);
    setSuggestionIndex(0);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  // Inline weight update handler
  const handleWeightChange = (entryId: string, val: string) => {
    const weight = parseFloat(val);
    if (!isNaN(weight) && weight >= 0) {
      updateFoodLogEntryWeight(entryId, weight);
    }
  };

  // Excel Copy/Paste Parser
  const handlePasteExcelSubmit = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split("\n");
    let addedCount = 0;

    lines.forEach(line => {
      const cells = line.split("\t");
      if (cells.length < 1 || !cells[0].trim()) return;

      const potentialFoodName = cells[0].trim().toLowerCase();
      const rawWeight = cells[1] ? parseFloat(cells[1].trim()) : 100;
      const weight = isNaN(rawWeight) ? 100 : rawWeight;

      // Find the best match in the food database
      const match = foodDatabase.find(f => 
        f.name.toLowerCase().includes(potentialFoodName) ||
        (f.synonyms && f.synonyms.toLowerCase().includes(potentialFoodName)) ||
        (f.code && f.code.toLowerCase().includes(potentialFoodName))
      ) || foodDatabase[0]; // fallback to first food

      if (match) {
        handleAddFood(match, weight);
        addedCount++;
      }
    });

    setPasteText("");
    setShowPasteModal(false);
    alert(`Successfully parsed and injected ${addedCount} spreadsheet rows.`);
  };

  // Bulk weight multiplier
  const handleApplyMultiplier = () => {
    if (multiplierValue <= 0 || isNaN(multiplierValue)) return;
    logs.forEach(log => {
      const newWeight = Math.round(log.weightGrams * multiplierValue);
      updateFoodLogEntryWeight(log.id, newWeight);
    });
    setShowMultiplierModal(false);
  };

  // Keyboard shortcut actions for standard input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (filteredFoods.length > 0) {
        handleAddFood(filteredFoods[suggestionIndex], weightGrams);
      }
    } else if (e.key === "Escape") {
      setIsSuggestOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionIndex(prev => Math.min(prev + 1, filteredFoods.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionIndex(prev => Math.max(0, prev - 1));
    }
  };

  // Grid Excel-like keyboard controls (Tab, Arrows, Delete, Enter)
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (!activeCell) return;
    const { row, col } = activeCell;
    const rowCount = logs.length;
    const colCount = 5; // [No, Name, Portion, Weight, Action] editable columns

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setActiveCell({ row: Math.max(0, row - 1), col });
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveCell({ row: Math.min(rowCount - 1, row + 1), col });
        break;
      case "ArrowLeft":
        e.preventDefault();
        setActiveCell({ row, col: Math.max(0, col - 1) });
        break;
      case "ArrowRight":
      case "Tab":
        e.preventDefault();
        setActiveCell({ row, col: Math.min(colCount - 1, col + 1) });
        break;
      case "Delete":
      case "Backspace":
        if (col === 3) { // Weight column
          updateFoodLogEntryWeight(logs[row].id, 0);
        } else if (col === 4) { // Action column
          removeFoodLogEntry(logs[row].id);
        }
        break;
      case "Escape":
        setActiveCell(null);
        break;
      default:
        break;
    }
  };

  // Recalculate totals for bottom row
  const totals = useMemo(() => {
    return logs.reduce((acc, log) => {
      acc.weight += log.weightGrams;
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      acc.fiber += log.fiber;
      acc.sodium += log.sodium;
      acc.calcium += log.calcium;
      acc.iron += log.iron;
      acc.vitaminC += log.vitaminC;
      acc.fatSaturated += log.fatSaturated || 0;
      acc.cholesterol += log.cholesterol || 0;
      return acc;
    }, {
      weight: 0,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      calcium: 0,
      iron: 0,
      vitaminC: 0,
      fatSaturated: 0,
      cholesterol: 0
    });
  }, [logs]);

  const handleExportJSON = () => {
    if (!activeProject) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeProject.name.replace(/\s+/g, "_")}_nutrisurvey_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-zinc-300 font-sans" id="spreadsheet-container">
      {/* Top Header Controls bar */}
      <div className="p-4 bg-[#121212] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h2 className="text-xs font-semibold tracking-wide text-white font-mono uppercase">
            {activeProject ? activeProject.name : "N/A"}
          </h2>
          <span className="text-[10px] bg-[#242424] text-[#00d4ff] px-2 py-0.5 rounded font-mono border border-zinc-800">
            {logs.length} Ingredients Loaded
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Paste Excel trigger */}
          <button
            onClick={() => setShowPasteModal(true)}
            className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-[11px] rounded text-zinc-300 font-mono font-medium flex items-center space-x-1.5 border border-zinc-700 transition-colors cursor-pointer"
            title="Paste values directly from MS Excel"
          >
            <Clipboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paste from Excel</span>
          </button>

          {/* Scale weights multiplier */}
          {logs.length > 0 && (
            <button
              onClick={() => setShowMultiplierModal(true)}
              className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-[11px] rounded text-zinc-300 font-mono font-medium flex items-center space-x-1.5 border border-zinc-700 transition-colors cursor-pointer"
              title="Apply weight multiplier"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Apply Multiplier</span>
            </button>
          )}

          {logs.length > 0 && (
            <>
              {/* Export to Excel */}
              <button
                onClick={() => {
                  const patient = activeProject ? {
                    id: activeProject.id,
                    code: `PAT-${activeProject.id.slice(0, 4).toUpperCase()}`,
                    name: activeProject.patientProfile.name,
                    dob: `${2024 - activeProject.patientProfile.age}-01-01`,
                    sex: activeProject.patientProfile.gender.toLowerCase() as "male" | "female",
                    height: activeProject.patientProfile.height,
                    weight: activeProject.patientProfile.weight,
                    activityLevel: activeProject.patientProfile.activityLevel,
                    phone: "",
                    email: ""
                  } : null;
                  exportService.exportToExcel(patient, logs);
                }}
                className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-[11px] rounded text-zinc-300 font-mono font-medium flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Export report to high-fidelity Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Excel</span>
              </button>

              {/* Export to PDF */}
              <button
                onClick={() => {
                  const patient = activeProject ? {
                    id: activeProject.id,
                    code: `PAT-${activeProject.id.slice(0, 4).toUpperCase()}`,
                    name: activeProject.patientProfile.name,
                    dob: `${2024 - activeProject.patientProfile.age}-01-01`,
                    sex: activeProject.patientProfile.gender.toLowerCase() as "male" | "female",
                    height: activeProject.patientProfile.height,
                    weight: activeProject.patientProfile.weight,
                    activityLevel: activeProject.patientProfile.activityLevel,
                    phone: "",
                    email: ""
                  } : null;
                  exportService.exportToPDF(patient, logs);
                }}
                className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-[11px] rounded text-zinc-300 font-mono font-medium flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Export report to clinic-branded PDF"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF</span>
              </button>

              {/* Export to Word */}
              <button
                onClick={() => {
                  const patient = activeProject ? {
                    id: activeProject.id,
                    code: `PAT-${activeProject.id.slice(0, 4).toUpperCase()}`,
                    name: activeProject.patientProfile.name,
                    dob: `${2024 - activeProject.patientProfile.age}-01-01`,
                    sex: activeProject.patientProfile.gender.toLowerCase() as "male" | "female",
                    height: activeProject.patientProfile.height,
                    weight: activeProject.patientProfile.weight,
                    activityLevel: activeProject.patientProfile.activityLevel,
                    phone: "",
                    email: ""
                  } : null;
                  exportService.exportToWord(patient, logs).catch((err) => {
                    console.error("Clinical Word export failed:", err);
                  });
                }}
                className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-[11px] rounded text-zinc-300 font-mono font-medium flex items-center space-x-1.5 transition-colors border border-zinc-700 cursor-pointer"
                title="Export report to professional MS Word document (.docx)"
              >
                <FileDown className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>Word</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="py-1.5 px-3 bg-zinc-850 hover:bg-zinc-800 text-[11px] rounded text-zinc-400 font-mono font-medium flex items-center space-x-1.5 transition-colors border border-zinc-800 cursor-pointer"
                title="Backup active project"
                id="export-sqlite-btn"
              >
                <span>JSON</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Reset seluruh isi spreadsheet harian?")) clearFoodLogs();
                }}
                className="py-1.5 px-3 bg-red-950/20 hover:bg-red-900/30 text-[11px] rounded text-red-400 font-medium transition-colors border border-red-900/40 cursor-pointer"
                id="clear-logs-btn"
              >
                Clear
              </button>
            </>
          )}

          {/* Preferences Settings Gear Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Open clinical settings & targets configuration"
          >
            <Settings className="w-4 h-4 text-[#00d4ff]" />
          </button>
        </div>
      </div>

      {/* Quick Add Search Bar & Suggestions */}
      <div className="p-4 bg-[#0c0c0c] border-b border-[#27272a] relative z-20">
        <div className="max-w-4xl flex items-center space-x-3">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search food by name, synonym, or NutriSurvey code... (e.g. Nasi, Tempe, BLS_B101)"
                value={searchQuery}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSuggestOpen(true);
                  setSuggestionIndex(0);
                }}
                className="w-full bg-[#121212] border border-[#27272a] rounded pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00d4ff]"
                id="food-search-input"
              />
            </div>

            {/* Suggestions Overlay Popover */}
            {isSuggestOpen && searchQuery && (
              <div className="absolute top-11 left-0 right-0 bg-[#121212] border border-[#27272a] rounded-md shadow-2xl overflow-hidden max-h-[350px] overflow-y-auto z-50">
                <div className="p-2 bg-[#0a0a0a] border-b border-[#27272a] text-[10px] font-mono text-zinc-500 tracking-wider flex justify-between">
                  <span>FOOD MATCHES (ARROWS TO NAVIGATE, ENTER TO ADD)</span>
                  <span className="text-[#00d4ff]">{filteredFoods.length} items</span>
                </div>
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food, idx) => (
                    <div
                      key={food.id}
                      onClick={() => handleAddFood(food, weightGrams)}
                      className={`p-3 cursor-pointer flex items-center justify-between transition-colors border-b border-[#1c1c1c] last:border-0 ${
                        suggestionIndex === idx ? "bg-[#242424] border-l-2 border-[#00d4ff]" : "hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">
                          {food.name} <span className="text-[10px] text-zinc-500 font-normal">({food.code || "N/A"})</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase">
                          {food.category} • {food.databaseSource || "CUSTOM"}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 text-right font-mono">
                        <span className="text-[#00d4ff]">{food.calories}</span> kcal • 
                        <span className="text-purple-400"> {food.protein}g</span> P • 
                        <span className="text-yellow-500"> {food.carbs}g</span> C
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No matching ingredients. Go to the "Reference Food Dictionary" tab to create your own!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-[120px] flex items-center space-x-2">
            <input
              type="number"
              min="1"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Math.max(1, parseInt(e.target.value) || 0))}
              placeholder="Grams"
              className="w-full bg-[#121212] border border-[#27272a] rounded px-3 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-[#00d4ff]"
            />
            <span className="text-xs text-zinc-400 font-mono font-medium">g</span>
          </div>

          <button
            onClick={() => {
              if (filteredFoods.length > 0) {
                handleAddFood(filteredFoods[suggestionIndex], weightGrams);
              }
            }}
            disabled={!searchQuery.trim()}
            className="px-4 py-2 bg-[#00d4ff] hover:bg-[#00b4df] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold text-xs rounded flex items-center space-x-1.5 transition-all cursor-pointer"
            id="inject-food-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Workspace Display */}
      <div className="flex-1 overflow-auto bg-[#0a0a0a]">
        {logs.length > 0 ? (
          <table 
            ref={tableRef}
            onKeyDown={handleGridKeyDown}
            tabIndex={0}
            className="w-full text-left border-collapse table-fixed min-w-[1430px] focus:outline-none" 
            id="nutri-grid-table"
          >
            <thead>
              <tr className="bg-[#121212] border-b border-[#27272a] text-[10px] font-mono uppercase text-zinc-400 tracking-wider sticky top-0 z-10">
                <th className="w-[50px] p-3 text-center">No</th>
                <th className="w-[240px] p-3">Food Ingredient Name</th>
                <th className="w-[140px] p-3">Portion Presets</th>
                <th className="w-[140px] p-3">Cooking Method</th>
                <th className="w-[110px] p-3 text-right">Weight (g)</th>
                <th className="w-[90px] p-3 text-right">Calories</th>
                <th className="w-[80px] p-3 text-right">Protein</th>
                <th className="w-[80px] p-3 text-right">Carbs</th>
                <th className="w-[80px] p-3 text-right">Fat</th>
                <th className="w-[90px] p-3 text-right">Sat Fat (g)</th>
                <th className="w-[90px] p-3 text-right">Chol (mg)</th>
                <th className="w-[80px] p-3 text-right">Sodium</th>
                <th className="w-[80px] p-3 text-right">Fiber</th>
                <th className="w-[80px] p-3 text-right">Calcium</th>
                <th className="w-[80px] p-3 text-right">Iron</th>
                <th className="w-[80px] p-3 text-right">Vit C</th>
                <th className="w-[60px] p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f21] text-xs">
              {logs.map((log, index) => {
                // Find matching food database item to list portions
                const matchingFood = foodDatabase.find(f => f.id === log.foodId);
                const portionsList = matchingFood?.portions || [{ name: "100g", weightGrams: 100 }];

                return (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-[#161618] transition-colors group text-zinc-300 font-sans ${
                      activeCell?.row === index ? "bg-[#18181b]/50" : ""
                    }`}
                  >
                    {/* Row No */}
                    <td 
                      onClick={() => setActiveCell({ row: index, col: 0 })}
                      className={`p-3 text-center font-mono ${
                        activeCell?.row === index && activeCell?.col === 0 
                          ? "bg-[#00d4ff]/10 text-[#00d4ff] font-bold border-l-2 border-[#00d4ff]" 
                          : "text-zinc-500"
                      }`}
                    >
                      {index + 1}
                    </td>
                    
                    {/* Food Name */}
                    <td 
                      onClick={() => setActiveCell({ row: index, col: 1 })}
                      className={`p-3 font-medium truncate ${
                        activeCell?.row === index && activeCell?.col === 1 
                          ? "bg-[#00d4ff]/10 text-white" 
                          : "text-zinc-100"
                      }`} 
                      title={log.name}
                    >
                      <span>{log.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 block">
                        {matchingFood?.databaseSource || "CUSTOM"} • {matchingFood?.code || "CUST"}
                      </span>
                    </td>
                    
                    {/* Portion Preset Dropdown Select */}
                    <td 
                      onClick={() => setActiveCell({ row: index, col: 2 })}
                      className={`p-3 ${
                        activeCell?.row === index && activeCell?.col === 2 ? "bg-[#00d4ff]/10" : ""
                      }`}
                    >
                      <select
                        value={log.portionName || "Custom"}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const foundPortion = portionsList.find(p => p.name === selectedName);
                          if (foundPortion) {
                            updateFoodLogEntryWeight(log.id, foundPortion.weightGrams, selectedName);
                          } else if (selectedName === "100g") {
                            updateFoodLogEntryWeight(log.id, 100, "100g");
                          }
                        }}
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-[#00d4ff] cursor-pointer"
                      >
                        <option value="Custom">Custom Size</option>
                        <option value="100g">100g Standard</option>
                        {portionsList.map((p, pIdx) => (
                          <option key={pIdx} value={p.name}>
                            {p.name} ({p.weightGrams}g)
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Cooking Method Dropdown Select */}
                    <td 
                      onClick={() => setActiveCell({ row: index, col: 16 })}
                      className={`p-3 ${
                        activeCell?.row === index && activeCell?.col === 16 ? "bg-[#00d4ff]/10" : ""
                      }`}
                    >
                      <select
                        value={log.cookingMethod || "raw"}
                        onChange={(e) => {
                          updateFoodLogEntryCookingMethod(log.id, e.target.value as any);
                        }}
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-xs text-[#00d4ff] font-mono focus:outline-none focus:border-[#00d4ff] cursor-pointer"
                      >
                        <option value="raw">Raw (Segar)</option>
                        <option value="boiled">Boiled (Rebus)</option>
                        <option value="steamed">Steamed (Kukus)</option>
                        <option value="fried">Fried (Goreng)</option>
                        <option value="grilled">Grilled (Bakar)</option>
                        <option value="baked">Baked (Oven)</option>
                        <option value="microwave">Microwave</option>
                      </select>
                    </td>
                    
                    {/* Interactive Weight Modifier */}
                    <td 
                      onClick={() => setActiveCell({ row: index, col: 3 })}
                      className={`p-3 ${
                        activeCell?.row === index && activeCell?.col === 3 ? "bg-[#00d4ff]/10" : ""
                      }`}
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <input
                           type="number"
                          value={log.weightGrams}
                          onChange={(e) => handleWeightChange(log.id, e.target.value)}
                          className="w-16 bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-right text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                        />
                        <div className="flex flex-col">
                          <button
                            onClick={() => updateFoodLogEntryWeight(log.id, log.weightGrams + 25)}
                            className="p-0.5 hover:text-[#00d4ff] text-zinc-500 rounded"
                            title="Tambah 25g"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => updateFoodLogEntryWeight(log.id, Math.max(0, log.weightGrams - 25))}
                            className="p-0.5 hover:text-[#00d4ff] text-zinc-500 rounded"
                            title="Kurangi 25g"
                          >
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    
                    {/* Sum of Nutrients */}
                    <td className="p-3 text-right font-mono text-zinc-100">{log.calories} <span className="text-[9px] text-zinc-500">kcal</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.protein.toFixed(1)} <span className="text-[9px] text-purple-400">g</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.carbs.toFixed(1)} <span className="text-[9px] text-amber-500">g</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.fat.toFixed(1)} <span className="text-[9px] text-rose-400">g</span></td>
                    
                    {/* Saturated Fat / Cholesterol */}
                    <td className="p-3 text-right font-mono text-zinc-400">
                      {log.fatSaturated !== undefined ? log.fatSaturated.toFixed(2) : "0.00"} <span className="text-[9px] text-zinc-600">g</span>
                    </td>
                    <td className="p-3 text-right font-mono text-zinc-400">
                      {log.cholesterol !== undefined ? log.cholesterol.toFixed(0) : "0"} <span className="text-[9px] text-zinc-600">mg</span>
                    </td>

                    <td className="p-3 text-right font-mono text-zinc-300">{log.sodium} <span className="text-[9px] text-zinc-500">mg</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.fiber.toFixed(1)} <span className="text-[9px] text-emerald-400">g</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.calcium} <span className="text-[9px] text-zinc-500">mg</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.iron.toFixed(1)} <span className="text-[9px] text-zinc-500">mg</span></td>
                    <td className="p-3 text-right font-mono text-zinc-300">{log.vitaminC.toFixed(1)} <span className="text-[9px] text-zinc-500">mg</span></td>
                    
                    {/* Actions column */}
                    <td 
                      onClick={() => setActiveCell({ row: index, col: 4 })}
                      className={`p-3 text-center ${
                        activeCell?.row === index && activeCell?.col === 4 ? "bg-[#00d4ff]/10" : ""
                      }`}
                    >
                      <button
                        onClick={() => removeFoodLogEntry(log.id)}
                        className="text-zinc-500 hover:text-red-500 p-1.5 rounded hover:bg-red-950/20 transition-all cursor-pointer"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* SUMMATION ROW */}
              <tr className="bg-[#121212]/90 border-t-2 border-[#27272a] text-xs font-semibold text-white sticky bottom-0">
                <td className="p-3 text-center font-mono text-[#00d4ff] uppercase text-[10px]" colSpan={4}>
                  DAILY TOTALS (∑)
                </td>
                <td className="p-3 text-right font-mono text-[#00d4ff]">{totals.weight.toFixed(0)} g</td>
                <td className="p-3 text-right font-mono text-[#00d4ff]">{totals.calories} kcal</td>
                <td className="p-3 text-right font-mono text-purple-400">{totals.protein.toFixed(1)} g</td>
                <td className="p-3 text-right font-mono text-yellow-500">{totals.carbs.toFixed(1)} g</td>
                <td className="p-3 text-right font-mono text-rose-400">{totals.fat.toFixed(1)} g</td>
                
                {/* Lipids totals */}
                <td className="p-3 text-right font-mono text-zinc-400">{totals.fatSaturated.toFixed(2)} g</td>
                <td className="p-3 text-right font-mono text-zinc-400">{totals.cholesterol.toFixed(0)} mg</td>

                <td className="p-3 text-right font-mono text-zinc-300">{totals.sodium} mg</td>
                <td className="p-3 text-right font-mono text-emerald-400">{totals.fiber.toFixed(1)} g</td>
                <td className="p-3 text-right font-mono text-zinc-300">{totals.calcium} mg</td>
                <td className="p-3 text-right font-mono text-zinc-300">{totals.iron.toFixed(1)} mg</td>
                <td className="p-3 text-right font-mono text-zinc-300">{totals.vitaminC.toFixed(1)} mg</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center max-w-lg mx-auto">
            <div className="p-4 rounded-full bg-[#242424] text-[#00d4ff] mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 font-mono">
              Spreadsheet Empty
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Begin by searching reference ingredients, selecting weight or portion size presets, and clicking <strong>Add Row</strong>.
            </p>
            <div className="bg-[#121212] border border-zinc-800 rounded p-4 text-[11px] font-mono text-left text-zinc-400 space-y-2 w-full">
              <div className="flex items-center space-x-2 text-[#00d4ff] font-semibold mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>EXCEL INTEGRATION SHORTCUTS</span>
              </div>
              <p>• Double click or press F2 to modify grams inline</p>
              <p>• Click "Paste from Excel" to inject multi-row sheets instantly</p>
              <p>• Press Arrow Keys to navigate cells, Enter to commit</p>
            </div>
          </div>
        )}
      </div>

      {/* PASTE EXCEL ROW MODAL */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center space-x-2">
                <Clipboard className="w-4 h-4 text-emerald-400" />
                <span>Paste Spreadsheet Rows</span>
              </h3>
              <button 
                onClick={() => setShowPasteModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste rows copied directly from Microsoft Excel or Google Sheets. The parser will search the active reference dictionaries and compile items automatically.
            </p>

            <div className="bg-[#0a0a0a] border border-zinc-800 rounded p-2 text-[10px] font-mono text-zinc-500 space-y-1">
              <p className="font-semibold text-zinc-400">EXPECTED FORMAT (TAB SEPARATED):</p>
              <p>Food Name [Tab] Grams</p>
              <p className="text-emerald-500 italic">Example:</p>
              <p className="text-zinc-400">Nasi Putih [Tab] 150</p>
              <p className="text-zinc-400">Tempe Kedelai [Tab] 60</p>
            </div>

            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste cells here..."
              className="w-full bg-[#1a1a1a] border border-zinc-700 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#00d4ff]"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
              >
                Batal
              </button>
              <button
                onClick={handlePasteExcelSubmit}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs text-black font-semibold"
              >
                Parse & Inject Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLIER MODAL */}
      {showMultiplierModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-lg max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Apply Weight Multiplier</span>
              </h3>
              <button 
                onClick={() => setShowMultiplierModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Multiply all logged item weights by a constant factor. Perfect for scaling recipe sizes up or down.
            </p>

            <div className="flex items-center space-x-3">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={multiplierValue}
                onChange={(e) => setMultiplierValue(parseFloat(e.target.value) || 1.0)}
                className="bg-[#1a1a1a] border border-zinc-700 rounded p-2 text-xs text-center font-mono text-white flex-1 focus:outline-none focus:border-[#00d4ff]"
              />
              <span className="text-xs text-zinc-400 font-mono">x</span>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowMultiplierModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
              >
                Batal
              </button>
              <button
                onClick={handleApplyMultiplier}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-xs text-black font-semibold cursor-pointer"
              >
                Apply Scaling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREFERENCES SETTINGS MODAL */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
