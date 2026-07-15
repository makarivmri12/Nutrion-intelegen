import React, { useState, useRef } from "react";
import { useNutriStore } from "../store/useNutriStore";
import { FoodItem } from "../types";
import { parseFtaDatabase } from "../services/databaseImport";
import { 
  Plus, 
  Database, 
  Search, 
  Sparkles, 
  BookOpen, 
  Upload, 
  FileText, 
  CheckCircle, 
  Info, 
  ChevronDown, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import FoodDatabaseEditor from "./database/FoodDatabaseEditor";
import RecipeEditor from "./database/RecipeEditor";
import AdvancedFoodSearch from "./search/AdvancedFoodSearch";
import FoodExchangeList from "./exchange/FoodExchangeList";
import OilsAndFatsHub from "./database/OilsAndFatsHub";

export default function FoodDatabaseTab() {
  const { 
    foodDatabase, 
    addCustomFoodItem, 
    addMultipleCustomFoodItems,
    selectedDatabaseSource, 
    setSelectedDatabaseSource 
  } = useNutriStore();
  
  const [subTab, setSubTab] = useState<"dictionary" | "custom_editor" | "recipe_editor" | "advanced_search" | "exchange" | "oils_fats_hub">("dictionary");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; count: number; filename: string } | null>(null);

  // Form states for adding custom food
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("Grains & Cereals");
  const [dbSource, setDbSource] = useState<any>("INDONESIAN");
  const [synonyms, setSynonyms] = useState("");
  
  // Portions State
  const [portions, setPortions] = useState<{ name: string; weightGrams: number }[]>([
    { name: "1 Porsi (Serving)", weightGrams: 100 }
  ]);
  const [portionInputName, setPortionInputName] = useState("");
  const [portionInputWeight, setPortionInputWeight] = useState(100);

  // Nutritional density per 100g
  const [calories, setCalories] = useState(100);
  const [protein, setProtein] = useState(5);
  const [carbs, setCarbs] = useState(20);
  const [fat, setFat] = useState(2);
  const [fiber, setFiber] = useState(1);
  const [sodium, setSodium] = useState(10);
  const [calcium, setCalcium] = useState(15);
  const [iron, setIron] = useState(1);
  const [vitaminC, setVitaminC] = useState(0);

  // Extra lipid/protein parameters
  const [fatSaturated, setFatSaturated] = useState(0);
  const [cholesterol, setCholesterol] = useState(0);
  const [leucine, setLeucine] = useState(0);
  const [lysine, setLysine] = useState(0);
  const [valine, setValine] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPortion = () => {
    if (!portionInputName.trim() || portionInputWeight <= 0) return;
    setPortions([...portions, { name: portionInputName.trim(), weightGrams: portionInputWeight }]);
    setPortionInputName("");
    setPortionInputWeight(100);
  };

  const handleRemovePortion = (idx: number) => {
    setPortions(portions.filter((_, i) => i !== idx));
  };

  const handleSubmitCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomFoodItem({
      name,
      code: code.trim() || `CUST-${Date.now().toString().slice(-4)}`,
      category,
      databaseSource: dbSource,
      synonyms: synonyms.trim() || undefined,
      portions: portions.length > 0 ? portions : undefined,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      calcium,
      iron,
      vitaminC,
      potassium: Math.round(protein * 30),
      magnesium: Math.round(fiber * 15),
      zinc: parseFloat((protein * 0.1).toFixed(1)),
      folate: Math.round(fiber * 8),
      vitaminA: 0,
      water: 75,
      sugar: Math.round(carbs * 0.2),
      fatSaturated: fatSaturated || undefined,
      cholesterol: cholesterol || undefined,
      leucine: leucine || undefined,
      lysine: lysine || undefined,
      valine: valine || undefined
    });

    // Reset Form
    setName("");
    setCode("");
    setSynonyms("");
    setPortions([{ name: "1 Porsi (Serving)", weightGrams: 100 }]);
    setCalories(100);
    setProtein(5);
    setCarbs(20);
    setFat(2);
    setFiber(1);
    setSodium(10);
    setCalcium(15);
    setIron(1);
    setVitaminC(0);
    setFatSaturated(0);
    setCholesterol(0);
    setLeucine(0);
    setLysine(0);
    setValine(0);
    setShowAddForm(false);
  };

  // Drag & Drop Handlers for .fta / .txt import
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsedFoods = parseFtaDatabase(text, "INDONESIAN");
      if (parsedFoods.length > 0) {
        addMultipleCustomFoodItems(parsedFoods);
        setImportStatus({
          success: true,
          count: parsedFoods.length,
          filename: file.name
        });
        setTimeout(() => setImportStatus(null), 8000);
      } else {
        alert("Tidak dapat menemukan data makanan valid. Pastikan file format NutriSurvey (.fta) atau baris tab-delimited.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saat membaca file.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  // Databases sources available
  const dbSourcesList = [
    { key: "ALL", label: "All Databases", desc: "Show ingredients from all tables" },
    { key: "INDONESIAN", label: "Indonesian TKPI", desc: "Politeknik Kesehatan Padang" },
    { key: "BLS", label: "German BLS", desc: "11,000 foods, high-fidelity nutrients" },
    { key: "USDA", label: "USDA SR28", desc: "Standard US nutrition database" },
    { key: "FAO", label: "FAO-Minilist", desc: "Worldwide top 200 foods" },
    { key: "BRAZILIAN", label: "Brazilian USP", desc: "Sao Paulo food table" },
    { key: "GUATEMALA", label: "Guatemala INCAP", desc: "Central America food source" },
    { key: "INDIAN", label: "Indian Food Table", desc: "ICMR nutrition reference" },
    { key: "KENYA", label: "Kenya Food Database", desc: "Sub-Saharan food reference" },
    { key: "EGYPT", label: "Egypt Food Database", desc: "Middle East nutrition library" },
    { key: "BOLIVIAN", label: "Bolivian Quinoa Table", desc: "Andean grain nutrition metrics" }
  ];

  // Filter foods by selected database source AND search query
  const filteredFoods = foodDatabase.filter((f) => {
    const matchesSource = selectedDatabaseSource === "ALL" || f.databaseSource === selectedDatabaseSource;
    const matchesSearch = !searchQuery.trim() || 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.synonyms && f.synonyms.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.code && f.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  if (subTab === "custom_editor") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button onClick={() => setSubTab("dictionary")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Database Dictionary</button>
          <button onClick={() => setSubTab("custom_editor")} className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer">Custom Foods</button>
          <button onClick={() => setSubTab("recipe_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Recipe Constructor</button>
          <button onClick={() => setSubTab("advanced_search")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Advanced Search</button>
          <button onClick={() => setSubTab("exchange")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Food Exchanges (PERSAGI)</button>
          <button onClick={() => setSubTab("oils_fats_hub")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Oils & Fats Analyzer</button>
        </div>
        <FoodDatabaseEditor />
      </div>
    );
  }

  if (subTab === "recipe_editor") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button onClick={() => setSubTab("dictionary")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Database Dictionary</button>
          <button onClick={() => setSubTab("custom_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Custom Foods</button>
          <button onClick={() => setSubTab("recipe_editor")} className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer">Recipe Constructor</button>
          <button onClick={() => setSubTab("advanced_search")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Advanced Search</button>
          <button onClick={() => setSubTab("exchange")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Food Exchanges (PERSAGI)</button>
          <button onClick={() => setSubTab("oils_fats_hub")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Oils & Fats Analyzer</button>
        </div>
        <RecipeEditor />
      </div>
    );
  }

  if (subTab === "advanced_search") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button onClick={() => setSubTab("dictionary")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Database Dictionary</button>
          <button onClick={() => setSubTab("custom_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Custom Foods</button>
          <button onClick={() => setSubTab("recipe_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Recipe Constructor</button>
          <button onClick={() => setSubTab("advanced_search")} className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer">Advanced Search</button>
          <button onClick={() => setSubTab("exchange")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Food Exchanges (PERSAGI)</button>
          <button onClick={() => setSubTab("oils_fats_hub")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Oils & Fats Analyzer</button>
        </div>
        <AdvancedFoodSearch />
      </div>
    );
  }

  if (subTab === "exchange") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button onClick={() => setSubTab("dictionary")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Database Dictionary</button>
          <button onClick={() => setSubTab("custom_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Custom Foods</button>
          <button onClick={() => setSubTab("recipe_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Recipe Constructor</button>
          <button onClick={() => setSubTab("advanced_search")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Advanced Search</button>
          <button onClick={() => setSubTab("exchange")} className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer">Food Exchanges (PERSAGI)</button>
          <button onClick={() => setSubTab("oils_fats_hub")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Oils & Fats Analyzer</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          <FoodExchangeList />
        </div>
      </div>
    );
  }

  if (subTab === "oils_fats_hub") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
        <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
          <button onClick={() => setSubTab("dictionary")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Database Dictionary</button>
          <button onClick={() => setSubTab("custom_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Custom Foods</button>
          <button onClick={() => setSubTab("recipe_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Recipe Constructor</button>
          <button onClick={() => setSubTab("advanced_search")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Advanced Search</button>
          <button onClick={() => setSubTab("exchange")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Food Exchanges (PERSAGI)</button>
          <button onClick={() => setSubTab("oils_fats_hub")} className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer">Oils & Fats Analyzer</button>
        </div>
        <div className="flex-1 overflow-hidden">
          <OilsAndFatsHub />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] flex flex-col min-h-0" id="food-database-container">
      {/* Sub-tab Bar */}
      <div className="bg-[#121212] border-b border-[#27272a] px-6 py-2 flex space-x-4">
        <button onClick={() => setSubTab("dictionary")} className="text-xs font-mono font-semibold px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 cursor-pointer">Database Dictionary</button>
        <button onClick={() => setSubTab("custom_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Custom Foods</button>
        <button onClick={() => setSubTab("recipe_editor")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Recipe Constructor</button>
        <button onClick={() => setSubTab("advanced_search")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Advanced Search</button>
        <button onClick={() => setSubTab("exchange")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Food Exchanges (PERSAGI)</button>
        <button onClick={() => setSubTab("oils_fats_hub")} className="text-xs font-mono font-medium px-3 py-1 rounded text-zinc-400 hover:text-white cursor-pointer">Oils & Fats Analyzer</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#00d4ff]" />
            <span>Multi-Country Food Database Dictionary</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse standard global databases or inject custom ingredients from NutriSurvey files (.fta).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="py-1.5 px-3 bg-[#18181b] hover:bg-zinc-800 text-xs rounded text-zinc-300 font-mono font-medium flex items-center space-x-1.5 border border-zinc-700 cursor-pointer"
            title="Import NutriSurvey .fta file"
          >
            <Upload className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import .FTA / .TXT</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".fta,.txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="py-1.5 px-3 bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "Back to Database" : "Create Ingredient"}</span>
          </button>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importStatus && (
        <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-lg flex items-start space-x-3 text-xs text-emerald-400 font-sans">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold uppercase tracking-wider text-[10px] font-mono">IMPORT SUCCESSFUL</p>
            <p className="mt-1">
              Successfully parsed and imported <strong>{importStatus.count}</strong> food entries from <strong>{importStatus.filename}</strong> into your custom database cache.
            </p>
          </div>
        </div>
      )}

      {showAddForm ? (
        /* Create Custom Food Entry Form with High-Fidelity details */
        <div className="max-w-4xl bg-[#121212] border border-[#27272a] rounded-lg p-6 space-y-5 animate-fade-in">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white tracking-wider font-mono uppercase flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#10b981]" />
              <span>Add Custom Clinical Food Ingredient</span>
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">RDA ALIGNED</span>
          </div>

          <form onSubmit={handleSubmitCustomFood} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sambal Bajak, Ketoprak Jakarta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Food Category Group *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                >
                  <option value="Grains & Cereals">Grains & Cereals</option>
                  <option value="Proteins">Proteins (Meat, Fish, Vegan)</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy & Alternatives">Dairy & Alternatives</option>
                  <option value="Fats, Seeds & Nuts">Fats, Seeds & Nuts</option>
                  <option value="Processed Foods">Processed Foods</option>
                  <option value="Soups">Soups & Broths</option>
                  <option value="Sauces & Condiments">Sauces & Condiments</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Database Origin
                </label>
                <select
                  value={dbSource}
                  onChange={(e) => setDbSource(e.target.value as any)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                >
                  <option value="INDONESIAN">Indonesian TKPI</option>
                  <option value="BLS">German BLS</option>
                  <option value="USDA">USDA SR28</option>
                  <option value="FAO">FAO-Minilist</option>
                  <option value="BRAZILIAN">Brazilian USP</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Unique Food Code (NutriSurvey ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. INA4012"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#10b981] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Synonyms / Local Names (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. sambal goreng, terasi chili, bajak chili"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#10b981]"
                />
              </div>
            </div>

            {/* Portions & Weight scaling presets */}
            <div className="p-4 bg-[#18181b] rounded-lg border border-zinc-800 space-y-3">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                Portion Presets (E.g., "1 piece", "1 plate")
              </span>
              
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Portion Name (e.g. 1 bowl)"
                  value={portionInputName}
                  onChange={(e) => setPortionInputName(e.target.value)}
                  className="bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white flex-1"
                />
                <input
                  type="number"
                  placeholder="Grams"
                  value={portionInputWeight}
                  onChange={(e) => setPortionInputWeight(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white w-24 text-right font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddPortion}
                  className="px-3 py-1.5 bg-[#27272a] hover:bg-zinc-700 text-xs rounded text-white font-mono uppercase"
                >
                  Add Portion
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {portions.map((port, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded border border-zinc-800 flex items-center space-x-1.5"
                  >
                    <span>{port.name}: {port.weightGrams}g</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemovePortion(idx)}
                      className="text-red-400 hover:text-red-500 font-bold ml-1 font-sans"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Basic nutrients per 100g */}
            <div className="p-4 bg-[#18181b] rounded-lg border border-zinc-800 space-y-4">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                Standard Nutrient Density (Measured per 100g of Ingredient)
              </span>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-0.5">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-purple-400 uppercase mb-0.5">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-yellow-500 uppercase mb-0.5">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-rose-400 uppercase mb-0.5">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-emerald-400 uppercase mb-0.5">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fiber}
                    onChange={(e) => setFiber(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-0.5">Sodium (mg)</label>
                  <input
                    type="number"
                    value={sodium}
                    onChange={(e) => setSodium(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-0.5">Calcium (mg)</label>
                  <input
                    type="number"
                    value={calcium}
                    onChange={(e) => setCalcium(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-0.5">Iron (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iron}
                    onChange={(e) => setIron(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-0.5">Vit C (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitaminC}
                    onChange={(e) => setVitaminC(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Clinical lipid / protein indicators */}
            <div className="p-4 bg-[#18181b] rounded-lg border border-zinc-800 space-y-4">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                Advanced Lipids & Amino Acids density (per 100g)
              </span>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-red-400 uppercase mb-0.5">Saturated Fat (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fatSaturated}
                    onChange={(e) => setFatSaturated(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-[#00d4ff] uppercase mb-0.5">Cholesterol (mg)</label>
                  <input
                    type="number"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-purple-300 uppercase mb-0.5">Leucine (mg)</label>
                  <input
                    type="number"
                    value={leucine}
                    onChange={(e) => setLeucine(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-purple-300 uppercase mb-0.5">Lysine (mg)</label>
                  <input
                    type="number"
                    value={lysine}
                    onChange={(e) => setLysine(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-purple-300 uppercase mb-0.5">Valine (mg)</label>
                  <input
                    type="number"
                    value={valine}
                    onChange={(e) => setValine(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#121212] border border-zinc-700 rounded p-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Register New Ingredient
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Browser list of switchable multi-country databases */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Databases selector rail */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-3 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block px-2.5 mb-2">
              Select Active Table
            </span>

            {dbSourcesList.map((db) => {
              const count = db.key === "ALL" 
                ? foodDatabase.length 
                : foodDatabase.filter(f => f.databaseSource === db.key).length;

              return (
                <button
                  key={db.key}
                  onClick={() => setSelectedDatabaseSource(db.key)}
                  className={`w-full text-left p-2.5 rounded text-xs transition-colors flex items-center justify-between group ${
                    selectedDatabaseSource === db.key 
                      ? "bg-[#00d4ff]/10 text-[#00d4ff] border-l-2 border-[#00d4ff] font-medium" 
                      : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{db.label}</span>
                    <span className="text-[9px] text-zinc-500 font-normal truncate max-w-[150px]">{db.desc}</span>
                  </div>
                  <span className="text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded font-mono text-zinc-400 group-hover:text-white">
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Drag & Drop Import Dropzone area built into bottom of rail */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`mt-4 p-4 border rounded text-center transition-all cursor-pointer ${
                dragActive 
                  ? "border-[#00d4ff] bg-[#00d4ff]/5" 
                  : "border-dashed border-zinc-800 hover:border-zinc-700 bg-[#0a0a0a]"
              }`}
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
            >
              <Upload className="w-5 h-5 mx-auto text-zinc-600 mb-1.5" />
              <p className="text-[10px] text-zinc-400 font-medium">Drag .FTA / .TXT here</p>
              <p className="text-[8px] text-zinc-600 mt-0.5">Supports NutriSurvey exports</p>
            </div>
          </div>

          {/* Browser List of items */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by ingredient name, synonym, code or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-[#27272a] rounded pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {filteredFoods.length} matches found
              </span>
            </div>

            <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[650px]" id="food-dictionary-table">
                  <thead>
                    <tr className="bg-[#1a1a1a] border-b border-[#27272a] text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                      <th className="p-3 w-[80px]">Code</th>
                      <th className="p-3">Ingredient Name</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Food Group</th>
                      <th className="p-3 text-right">Calories</th>
                      <th className="p-3 text-right">Protein</th>
                      <th className="p-3 text-right">Carbs</th>
                      <th className="p-3 text-right">Fat</th>
                      <th className="p-3 text-right">Fiber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {filteredFoods.length > 0 ? (
                      filteredFoods.map((food) => (
                        <tr key={food.id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="p-3 font-mono text-[10px] text-zinc-500">{food.code || "N/A"}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white group-hover:text-[#00d4ff] transition-colors">{food.name}</span>
                              {food.synonyms && (
                                <span className="text-[10px] text-zinc-500 italic font-mono tracking-tight">Alt: {food.synonyms}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[9px] font-mono uppercase bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
                              {food.databaseSource || "CUSTOM"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-800/40">
                              {food.category}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-100">{food.calories} kcal</td>
                          <td className="p-3 text-right font-mono text-purple-400">{food.protein.toFixed(1)} g</td>
                          <td className="p-3 text-right font-mono text-amber-500">{food.carbs.toFixed(1)} g</td>
                          <td className="p-3 text-right font-mono text-rose-400">{food.fat.toFixed(1)} g</td>
                          <td className="p-3 text-right font-mono text-emerald-400">{food.fiber.toFixed(1)} g</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-xs text-zinc-500 font-mono">
                          No matching ingredients found. Select another database tab or import a NutriSurvey .fta file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
