import React, { useState, useMemo } from "react";
import { useNutriStore } from "../../store/useNutriStore";
import { FoodItem } from "../../types";
import { 
  Database, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  Download, 
  Check, 
  AlertCircle, 
  Filter,
  FileSpreadsheet
} from "lucide-react";

export default function FoodDatabaseEditor() {
  const { foodDatabase, addCustomFoodItem, updateCustomFoodItem, deleteCustomFoodItem, addMultipleCustomFoodItems } = useNutriStore();

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  
  // Nutrient values state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [sodium, setSodium] = useState(0);
  const [calcium, setCalcium] = useState(0);
  const [iron, setIron] = useState(0);
  const [vitaminC, setVitaminC] = useState(0);
  const [water, setWater] = useState(0);
  const [sugar, setSugar] = useState(0);
  
  // Source attribution
  const [databaseSource, setDatabaseSource] = useState<any>("BLS");

  // Errors state
  const [validationError, setValidationError] = useState("");

  // Bulk import/export state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkStatus, setBulkStatus] = useState({ success: false, message: "" });

  // Get only custom foods or all foods that can be modified
  // Usually custom foods start with "food-custom-" or have no standard short code.
  // Let's show all custom foods first, or let them view everything!
  const onlyCustomFoods = useMemo(() => {
    return foodDatabase.filter(f => f.id.startsWith("food-custom-") || f.databaseSource === undefined);
  }, [foodDatabase]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    foodDatabase.forEach(f => { if (f.category) set.add(f.category); });
    return ["ALL", ...Array.from(set)];
  }, [foodDatabase]);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return onlyCustomFoods.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (f.code && f.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = selectedCategory === "ALL" || f.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [onlyCustomFoods, searchTerm, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setCode(`CUST-${Math.floor(1000 + Math.random() * 9000)}`);
    setName("");
    setCategory("Vegetables");
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setFiber(0);
    setSodium(0);
    setCalcium(0);
    setIron(0);
    setVitaminC(0);
    setWater(0);
    setSugar(0);
    setDatabaseSource("BLS");
    setValidationError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setCode(item.code || "");
    setName(item.name);
    setCategory(item.category);
    setCalories(item.calories);
    setProtein(item.protein);
    setCarbs(item.carbs);
    setFat(item.fat);
    setFiber(item.fiber);
    setSodium(item.sodium);
    setCalcium(item.calcium);
    setIron(item.iron);
    setVitaminC(item.vitaminC);
    setWater(item.water);
    setSugar(item.sugar);
    setDatabaseSource(item.databaseSource || "BLS");
    setValidationError("");
    setIsFormOpen(true);
  };

  const validateInputs = (): boolean => {
    if (!name.trim()) {
      setValidationError("Name cannot be empty.");
      return false;
    }
    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0 || fiber < 0 || sodium < 0 || calcium < 0 || iron < 0 || vitaminC < 0 || water < 0 || sugar < 0) {
      setValidationError("Nutrient values cannot be negative.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    const foodData: Omit<FoodItem, "id"> = {
      code: code.trim() || undefined,
      name: name.trim(),
      category,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      calcium,
      iron,
      vitaminC,
      potassium: 0,
      magnesium: 0,
      zinc: 0,
      folate: 0,
      vitaminA: 0,
      water,
      sugar,
      databaseSource
    };

    if (editingItem) {
      updateCustomFoodItem(editingItem.id, foodData);
    } else {
      addCustomFoodItem(foodData);
    }

    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this custom food item?")) {
      deleteCustomFoodItem(id);
    }
  };

  // Bulk Import
  const handleBulkImport = () => {
    try {
      if (!bulkText.trim()) {
        setBulkStatus({ success: false, message: "Please paste JSON data first." });
        return;
      }

      const parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed)) {
        setBulkStatus({ success: false, message: "JSON must be an array of food objects." });
        return;
      }

      // Check essential fields
      const formattedFoods: Omit<FoodItem, "id">[] = parsed.map((item: any) => ({
        code: item.code || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: item.name || "Unnamed Food",
        category: item.category || "General",
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        fiber: Number(item.fiber) || 0,
        sodium: Number(item.sodium) || 0,
        calcium: Number(item.calcium) || 0,
        iron: Number(item.iron) || 0,
        vitaminC: Number(item.vitaminC) || 0,
        potassium: Number(item.potassium) || 0,
        magnesium: Number(item.magnesium) || 0,
        zinc: Number(item.zinc) || 0,
        folate: Number(item.folate) || 0,
        vitaminA: Number(item.vitaminA) || 0,
        water: Number(item.water) || 0,
        sugar: Number(item.sugar) || 0,
        databaseSource: "BLS"
      }));

      addMultipleCustomFoodItems(formattedFoods);
      setBulkStatus({ success: true, message: `Successfully imported ${formattedFoods.length} custom food records!` });
      setBulkText("");
      setTimeout(() => setBulkStatus({ success: false, message: "" }), 4000);
    } catch (e: any) {
      setBulkStatus({ success: false, message: `Parsing Error: ${e.message}` });
    }
  };

  // Bulk Export
  const handleBulkExport = () => {
    const exportedText = JSON.stringify(onlyCustomFoods, null, 2);
    setBulkText(exportedText);
    setBulkStatus({ success: true, message: "Custom foods exported to text-field below. Copy to clipboard." });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 font-sans text-zinc-300" id="food-database-editor-container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#00d4ff]" />
            <span>Custom Food Database & Nutrient Editor</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Build custom foods, edit nutrient values per 100g, and bulk import/export local databases.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsBulkOpen(!isBulkOpen);
              setBulkStatus({ success: false, message: "" });
            }}
            className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-xs rounded border border-zinc-700 text-zinc-300 font-semibold flex items-center space-x-1 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Import/Export</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-1.5 px-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-xs rounded flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Food</span>
          </button>
        </div>
      </div>

      {/* Bulk Area */}
      {isBulkOpen && (
        <div className="mb-6 bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Bulk Database Transporter (JSON Format)
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Structure: Array of objects containing name, category, calories, protein, carbs, fat, etc.
            </span>
          </div>

          <textarea
            rows={5}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder='Paste JSON array here...\nExample:\n[\n  { "name": "Custom Tempe Goreng", "category": "Proteins", "calories": 210, "protein": 18, "carbs": 12, "fat": 10 }\n]'
            className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-[#00d4ff]"
          />

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={handleBulkImport}
                className="py-1.5 px-3 bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-xs rounded flex items-center space-x-1 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Parse & Import</span>
              </button>
              <button
                onClick={handleBulkExport}
                className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded flex items-center space-x-1 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Custom Foods</span>
              </button>
            </div>

            {bulkStatus.message && (
              <span className={`text-xs font-mono font-semibold ${bulkStatus.success ? "text-emerald-400" : "text-rose-400"}`}>
                {bulkStatus.message}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main split: Food list and editor form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foods Registry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Custom Foods Registry ({filteredFoods.length} Items)
              </span>

              <div className="flex items-center space-x-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search custom foods..."
                    className="w-[180px] bg-[#1a1a1a] border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                {/* Filter */}
                <div className="relative flex items-center">
                  <Filter className="absolute left-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 pb-2">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">kcal</th>
                    <th className="pb-2 text-right">Protein (g)</th>
                    <th className="pb-2 text-right">Carbs (g)</th>
                    <th className="pb-2 text-right">Fat (g)</th>
                    <th className="pb-2 text-right">Water (g)</th>
                    <th className="pb-2 text-center w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-zinc-500 font-mono text-xs">
                        No custom foods registered. Click "Add Custom Food" or bulk import records.
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map((f) => (
                      <tr key={f.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                        <td className="py-2.5 font-mono text-zinc-500">{f.code || "-"}</td>
                        <td className="py-2.5 font-semibold text-white">{f.name}</td>
                        <td className="py-2.5 text-zinc-400">{f.category}</td>
                        <td className="py-2.5 text-right font-mono">{f.calories}</td>
                        <td className="py-2.5 text-right font-mono text-[#00d4ff]">{f.protein}</td>
                        <td className="py-2.5 text-right font-mono text-purple-400">{f.carbs}</td>
                        <td className="py-2.5 text-right font-mono text-amber-500">{f.fat}</td>
                        <td className="py-2.5 text-right font-mono text-zinc-500">{f.water || "0"}</td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleOpenEdit(f)}
                              className="p-1 hover:text-[#00d4ff] rounded transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              className="p-1 hover:text-red-400 rounded transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Editor sidebar panel */}
        <div>
          {isFormOpen ? (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4 animate-fade-in">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white block pb-2 border-b border-zinc-800">
                {editingItem ? "Edit Food Specification" : "Register Custom Food"}
              </span>

              <form onSubmit={handleSubmit} className="space-y-4">
                {validationError && (
                  <div className="p-2.5 bg-rose-950/10 border border-rose-900/30 rounded flex items-center space-x-2 text-[10px] text-rose-400 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Food Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CUST-5002"
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tempe Goreng Mentega"
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Proteins">Proteins</option>
                      <option value="Carbohydrates">Carbohydrates</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Fats & Oils">Fats & Oils</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Sweets">Sweets</option>
                      <option value="Grains & Cereals">Grains & Cereals</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Source</label>
                    <select
                      value={databaseSource}
                      onChange={(e) => setDatabaseSource(e.target.value as any)}
                      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                    >
                      <option value="BLS">BLS (German)</option>
                      <option value="USDA">USDA (US)</option>
                      <option value="FAO">FAO-Minilist</option>
                      <option value="INDONESIAN">Indonesian</option>
                    </select>
                  </div>
                </div>

                {/* Nutrients parameters */}
                <div className="border-t border-zinc-800/60 pt-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                    Macronutrients & Water (per 100g)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        min="0"
                        value={calories}
                        onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Water (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={water}
                        onChange={(e) => setWater(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Protein (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={protein}
                        onChange={(e) => setProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={carbs}
                        onChange={(e) => setCarbs(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Fat (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={fat}
                        onChange={(e) => setFat(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Fiber (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={fiber}
                        onChange={(e) => setFiber(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>
                  </div>
                </div>

                {/* Micro nutrients */}
                <div className="border-t border-zinc-800/60 pt-3">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                    Micronutrients & Sugars
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Sugar (g)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={sugar}
                        onChange={(e) => setSugar(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Sodium (mg)</label>
                      <input
                        type="number"
                        min="0"
                        value={sodium}
                        onChange={(e) => setSodium(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Calcium (mg)</label>
                      <input
                        type="number"
                        min="0"
                        value={calcium}
                        onChange={(e) => setCalcium(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Iron (mg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={iron}
                        onChange={(e) => setIron(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#7c3aed]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingItem(null);
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] uppercase font-mono font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-[10px] uppercase font-mono"
                  >
                    {editingItem ? "Update Food" : "Add Food"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 text-center py-12 text-zinc-500 font-mono text-xs">
              Select any custom food record to edit its detailed nutritional specification, or click "Add Custom Food" to construct a new profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
