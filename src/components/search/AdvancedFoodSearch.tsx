import React, { useState, useMemo } from "react";
import { useNutriStore } from "../../store/useNutriStore";
import { FoodItem } from "../../types";
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Check, 
  HelpCircle,
  Sparkles,
  Flame,
  Dna,
  ShieldCheck,
  Wheat
} from "lucide-react";

export default function AdvancedFoodSearch() {
  const { foodDatabase, addFoodLogEntry } = useNutriStore();

  // Range states
  const [minCal, setMinCal] = useState<number | "">("");
  const [maxCal, setMaxCal] = useState<number | "">("");
  const [minProtein, setMinProtein] = useState<number | "">("");
  const [maxProtein, setMaxProtein] = useState<number | "">("");
  const [minCarbs, setMinCarbs] = useState<number | "">("");
  const [maxCarbs, setMaxCarbs] = useState<number | "">("");
  const [minFat, setMinFat] = useState<number | "">("");
  const [maxFat, setMaxFat] = useState<number | "">("");

  // Search & sorting
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"calories" | "protein" | "carbs" | "fat">("calories");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Quick logging state
  const [selectedLogFood, setSelectedLogFood] = useState<FoodItem | null>(null);
  const [logWeight, setLogWeight] = useState(100);
  const [logSuccessMessage, setLogSuccessMessage] = useState("");

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    foodDatabase.forEach(f => { if (f.category) set.add(f.category); });
    return ["ALL", ...Array.from(set)];
  }, [foodDatabase]);

  // Main Filter Logic
  const results = useMemo(() => {
    let list = [...foodDatabase];

    // Filter by keyword
    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(k) || (f.code && f.code.toLowerCase().includes(k)));
    }

    // Filter by category
    if (categoryFilter !== "ALL") {
      list = list.filter(f => f.category === categoryFilter);
    }

    // Filter by nutrient ranges
    list = list.filter(f => {
      if (minCal !== "" && f.calories < Number(minCal)) return false;
      if (maxCal !== "" && f.calories > Number(maxCal)) return false;
      if (minProtein !== "" && f.protein < Number(minProtein)) return false;
      if (maxProtein !== "" && f.protein > Number(maxProtein)) return false;
      if (minCarbs !== "" && f.carbs < Number(minCarbs)) return false;
      if (maxCarbs !== "" && f.carbs > Number(maxCarbs)) return false;
      if (minFat !== "" && f.fat < Number(minFat)) return false;
      if (maxFat !== "" && f.fat > Number(maxFat)) return false;
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      const valA = a[sortBy] || 0;
      const valB = b[sortBy] || 0;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });

    return list.slice(0, 100); // Limit to top 100 matches
  }, [foodDatabase, keyword, categoryFilter, minCal, maxCal, minProtein, maxProtein, minCarbs, maxCarbs, minFat, maxFat, sortBy, sortOrder]);

  const handleQuickAdd = (food: FoodItem) => {
    setSelectedLogFood(food);
    setLogWeight(100);
    setLogSuccessMessage("");
  };

  const handleConfirmAddLog = () => {
    if (!selectedLogFood || logWeight <= 0) return;
    addFoodLogEntry(selectedLogFood, logWeight);
    setLogSuccessMessage(`Added ${logWeight}g of ${selectedLogFood.name} to project log!`);
    setTimeout(() => {
      setSelectedLogFood(null);
      setLogSuccessMessage("");
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 font-sans text-zinc-300" id="advanced-search-container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-[#00d4ff]" />
            <span>Therapeutic Nutrient-Range Search Engine</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Perform granular search queries based on nutrient density ranges to optimize target therapies and meal plans.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Form: Sliders & Ranges */}
        <div className="space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block pb-2 border-b border-zinc-800">
              Nutrient Density Bounds
            </span>

            <div className="space-y-4">
              {/* Calories bounds */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center space-x-1 mb-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Calories (kcal / 100g)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minCal}
                    onChange={(e) => setMinCal(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxCal}
                    onChange={(e) => setMaxCal(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {/* Protein bounds */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center space-x-1 mb-1.5">
                  <Dna className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span>Protein (g / 100g)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minProtein}
                    onChange={(e) => setMinProtein(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxProtein}
                    onChange={(e) => setMaxProtein(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {/* Carbohydrates bounds */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center space-x-1 mb-1.5">
                  <Wheat className="w-3.5 h-3.5 text-purple-400" />
                  <span>Carbohydrates (g / 100g)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minCarbs}
                    onChange={(e) => setMinCarbs(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxCarbs}
                    onChange={(e) => setMaxCarbs(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {/* Fats bounds */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase flex items-center space-x-1 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fats (g / 100g)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minFat}
                    onChange={(e) => setMinFat(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxFat}
                    onChange={(e) => setMaxFat(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setMinCal("");
                setMaxCal("");
                setMinProtein("");
                setMaxProtein("");
                setMinCarbs("");
                setMaxCarbs("");
                setMinFat("");
                setMaxFat("");
                setKeyword("");
                setCategoryFilter("ALL");
              }}
              className="w-full py-1.5 mt-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono uppercase font-semibold text-zinc-400 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Right Area: Results Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Matches Found ({results.length} items shown)
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search string */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Filter by keyword..."
                    className="w-[150px] bg-[#1a1a1a] border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                {/* Category select */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#1a1a1a] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categories.filter(c => c !== "ALL").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Sort selector */}
                <div className="flex items-center space-x-1 border border-zinc-800 rounded bg-[#1a1a1a] px-2 py-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="calories">Calories</option>
                    <option value="protein">Protein</option>
                    <option value="carbs">Carbs</option>
                    <option value="fat">Fat</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="text-zinc-400 hover:text-white px-1 text-xs font-mono font-bold"
                  >
                    {sortOrder === "desc" ? "DESC" : "ASC"}
                  </button>
                </div>
              </div>
            </div>

            {/* Selection log overlay form */}
            {selectedLogFood && (
              <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-md space-y-3 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-white">Log Entry: <strong>{selectedLogFood.name}</strong></span>
                  <span className="text-[10px] font-mono text-zinc-500">Category: {selectedLogFood.category}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative max-w-[150px]">
                    <input
                      type="number"
                      value={logWeight}
                      onChange={(e) => setLogWeight(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white font-mono text-right focus:outline-none focus:border-[#00d4ff]"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] text-zinc-500 font-mono pointer-events-none">grams</span>
                  </div>

                  <button
                    onClick={handleConfirmAddLog}
                    className="px-4 py-1.5 bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-xs rounded transition-colors cursor-pointer"
                  >
                    Confirm Log Entry
                  </button>
                  <button
                    onClick={() => setSelectedLogFood(null)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {logSuccessMessage && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center space-x-1.5 pt-1">
                    <Check className="w-4 h-4" />
                    <span>{logSuccessMessage}</span>
                  </p>
                )}
              </div>
            )}

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 pb-2">
                    <th className="pb-2">Food item name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">kcal</th>
                    <th className="pb-2 text-right">Protein (g)</th>
                    <th className="pb-2 text-right">Carbs (g)</th>
                    <th className="pb-2 text-right">Fat (g)</th>
                    <th className="pb-2 text-right">Fiber (g)</th>
                    <th className="pb-2 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500 font-mono">
                        No foods matching specified therapeutic range criteria. Try relaxing the min/max limits.
                      </td>
                    </tr>
                  ) : (
                    results.map((f) => (
                      <tr key={f.id} className="hover:bg-[#1a1a1a]/40 transition-colors">
                        <td className="py-3 font-semibold text-white">{f.name}</td>
                        <td className="py-3 text-zinc-400">{f.category}</td>
                        <td className="py-3 text-right font-mono font-medium">{f.calories}</td>
                        <td className="py-3 text-right font-mono text-[#00d4ff]">{f.protein}g</td>
                        <td className="py-3 text-right font-mono text-purple-400">{f.carbs}g</td>
                        <td className="py-3 text-right font-mono text-amber-500">{f.fat}g</td>
                        <td className="py-3 text-right font-mono text-emerald-400">{f.fiber || "0"}g</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleQuickAdd(f)}
                            className="py-1 px-2.5 bg-[#18181b] hover:bg-[#7c3aed] hover:text-white rounded text-[10px] font-mono font-semibold border border-zinc-800 flex items-center justify-center space-x-1.5 transition-all cursor-pointer mx-auto"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Quick Log</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
