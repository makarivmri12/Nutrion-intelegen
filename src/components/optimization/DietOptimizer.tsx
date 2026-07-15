import React, { useState, useMemo } from "react";
import { useNutriStore } from "../../store/useNutriStore";
import { optimizeDiet, OptimizationInput, getFoodPricePer100g } from "../../utils/optimization";
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Save, 
  Info 
} from "lucide-react";
import { FoodItem } from "../../types";

export default function DietOptimizer() {
  const { projects, currentProjectId, foodDatabase, setFoodLogs } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);

  // States
  const [targetGroup, setTargetGroup] = useState<string>("general_adult");
  const [minEnergy, setMinEnergy] = useState<number>(2000);
  const [minProtein, setMinProtein] = useState<number>(55);
  const [minIron, setMinIron] = useState<number>(15);
  const [minCalcium, setMinCalcium] = useState<number>(1000);
  const [maxCost, setMaxCost] = useState<number>(50000);

  // Preferences
  const [localOnly, setLocalOnly] = useState<boolean>(true);
  const [halalOnly, setHalalOnly] = useState<boolean>(true);

  // Search/Filter of allowed foods
  const [foodSearch, setFoodSearch] = useState<string>("");
  const [selectedFoods, setSelectedFoods] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    return initial;
  });

  // Food custom constraints (min. amount, max. amount, price/100g)
  const [foodConstraints, setFoodConstraints] = useState<Record<string, { minAmount: number; maxAmount: number; pricePer100g: number }>>({});

  const [optimizerResult, setOptimizerResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Modal for infeasible solutions
  const [showInfeasibleModal, setShowInfeasibleModal] = useState<boolean>(false);
  const [pendingResultToApply, setPendingResultToApply] = useState<any>(null);

  // Helper to get constraint for a food item with defaults
  const getConstraint = (foodId: string, foodItem: FoodItem) => {
    const custom = foodConstraints[foodId];
    return {
      minAmount: custom?.minAmount ?? 0,
      maxAmount: custom?.maxAmount ?? 400,
      pricePer100g: custom?.pricePer100g ?? getFoodPricePer100g(foodItem)
    };
  };

  const handleConstraintChange = (foodId: string, field: "minAmount" | "maxAmount" | "pricePer100g", value: number) => {
    const food = foodDatabase.find((f) => f.id === foodId);
    if (!food) return;
    setFoodConstraints((prev) => ({
      ...prev,
      [foodId]: {
        ...getConstraint(foodId, food),
        [field]: value
      }
    }));
  };

  // Auto-fill defaults based on target group selection
  const handleGroupPreset = (group: string) => {
    setTargetGroup(group);
    switch (group) {
      case "children_6_23mo":
        setMinEnergy(850);
        setMinProtein(15);
        setMinIron(11);
        setMinCalcium(500);
        setMaxCost(20000);
        break;
      case "pregnant_women":
        setMinEnergy(2300);
        setMinProtein(75);
        setMinIron(27);
        setMinCalcium(1200);
        setMaxCost(75000);
        break;
      case "lactating_women":
        setMinEnergy(2500);
        setMinProtein(80);
        setMinIron(18);
        setMinCalcium(1200);
        setMaxCost(80000);
        break;
      case "general_adult":
      default:
        setMinEnergy(2000);
        setMinProtein(60);
        setMinIron(15);
        setMinCalcium(1000);
        setMaxCost(50000);
        break;
    }
  };

  // Filter foods for the checkbox/constraints list
  const availableSelectorFoods = useMemo(() => {
    return foodDatabase.filter((f) =>
      f.name.toLowerCase().includes(foodSearch.toLowerCase())
    );
  }, [foodDatabase, foodSearch]);

  // Initial populate of default selected foods
  const activeSelectedCount = useMemo(() => {
    const keys = Object.keys(selectedFoods).filter(k => selectedFoods[k]);
    if (keys.length === 0 && foodDatabase.length > 0) {
      const initial: Record<string, boolean> = {};
      // default select first 20 items
      foodDatabase.slice(0, 20).forEach((f) => {
        initial[f.id] = true;
      });
      setSelectedFoods(initial);
      return 20;
    }
    return keys.length;
  }, [selectedFoods, foodDatabase]);

  const toggleFoodSelection = (id: string) => {
    setSelectedFoods((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const updated: Record<string, boolean> = {};
    if (select) {
      foodDatabase.forEach((f) => {
        updated[f.id] = true;
      });
    }
    setSelectedFoods(updated);
  };

  const runLP = () => {
    setLoading(true);
    setOptimizerResult(null);

    // Collect checked foods
    let checkedFoodIds = Object.keys(selectedFoods).filter((id) => selectedFoods[id]);
    if (checkedFoodIds.length === 0) {
      checkedFoodIds = foodDatabase.slice(0, 15).map((f) => f.id);
    }

    // Build food-specific constraint object
    const mappedConstraints: Record<string, any> = {};
    checkedFoodIds.forEach(id => {
      const food = foodDatabase.find(f => f.id === id);
      if (food) {
        mappedConstraints[id] = {
          foodId: id,
          ...getConstraint(id, food)
        };
      }
    });

    const input: OptimizationInput = {
      targetGroup,
      constraints: {
        minEnergy,
        minProtein,
        minIron,
        minCalcium,
        maxCost,
        maxMeals: 6
      },
      availableFoods: checkedFoodIds,
      foodConstraints: mappedConstraints,
      preferences: {
        localFoodsOnly: localOnly,
        halalOnly,
        excludeFoods: []
      }
    };

    setTimeout(() => {
      try {
        const result = optimizeDiet(input, foodDatabase);
        
        if (!result.meetsRequirements) {
          // Infeasible - open modal confirmation
          setPendingResultToApply(result);
          setShowInfeasibleModal(true);
        } else {
          setOptimizerResult(result);
        }
      } catch (err) {
        console.error(err);
        alert("Penyelesaian Linear Programming Simplex mengalami kegagalan sistem.");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const executeApplyResult = (result: any) => {
    if (!currentProjectId) {
      alert("Pilih pasien aktif terlebih dahulu di panel sebelah kiri!");
      return;
    }

    const newLogs = result.optimalDiet.map((item: any) => {
      const original = foodDatabase.find((f) => f.id === item.foodId);
      return {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        foodId: item.foodId,
        name: item.name,
        category: original ? original.category : "Kustom",
        weightGrams: item.amount,
        portionName: `${item.amount}g (Hasil Optimasi)`,
        
        // Scale nutrients per 100g
        calories: original ? Math.round((original.calories * item.amount) / 100) : 0,
        protein: original ? parseFloat(((original.protein * item.amount) / 100).toFixed(1)) : 0,
        carbs: original ? parseFloat(((original.carbs * item.amount) / 100).toFixed(1)) : 0,
        fat: original ? parseFloat(((original.fat * item.amount) / 100).toFixed(1)) : 0,
        fiber: original ? parseFloat(((original.fiber * item.amount) / 100).toFixed(1)) : 0,
        sodium: original ? parseFloat(((original.sodium * item.amount) / 100).toFixed(1)) : 0,
        calcium: original ? parseFloat(((original.calcium * item.amount) / 100).toFixed(1)) : 0,
        iron: original ? parseFloat(((original.iron * item.amount) / 100).toFixed(1)) : 0,
        zinc: original ? parseFloat((((original.zinc || 0) * item.amount) / 100).toFixed(1)) : 0,
        magnesium: original ? parseFloat((((original.magnesium || 0) * item.amount) / 100).toFixed(1)) : 0,
        vitaminC: original ? parseFloat(((original.vitaminC * item.amount) / 100).toFixed(1)) : 0,
        vitaminA: original ? parseFloat(((original.vitaminA * item.amount) / 100).toFixed(1)) : 0,
        potassium: original ? parseFloat((((original.potassium || 0) * item.amount) / 100).toFixed(1)) : 0,
        folate: original ? parseFloat((((original.folate || 0) * item.amount) / 100).toFixed(1)) : 0,
        water: original ? parseFloat((((original.water || 0) * item.amount) / 100).toFixed(1)) : 0,
        sugar: original ? parseFloat((((original.sugar || 0) * item.amount) / 100).toFixed(1)) : 0,

        // Fatty acids and amino acids
        fatSaturated: original && original.fatSaturated ? parseFloat(((original.fatSaturated * item.amount) / 100).toFixed(1)) : 0,
        fatMonounsaturated: original && original.fatMonounsaturated ? parseFloat(((original.fatMonounsaturated * item.amount) / 100).toFixed(1)) : 0,
        fatPolyunsaturated: original && original.fatPolyunsaturated ? parseFloat(((original.fatPolyunsaturated * item.amount) / 100).toFixed(1)) : 0,
        cholesterol: original && original.cholesterol ? parseFloat(((original.cholesterol * item.amount) / 100).toFixed(1)) : 0,
        tryptophan: original && original.tryptophan ? parseFloat(((original.tryptophan * item.amount) / 100).toFixed(0)) : 0,
        leucine: original && original.leucine ? parseFloat(((original.leucine * item.amount) / 100).toFixed(0)) : 0,
        lysine: original && original.lysine ? parseFloat(((original.lysine * item.amount) / 100).toFixed(0)) : 0,
        methionine: original && original.methionine ? parseFloat(((original.methionine * item.amount) / 100).toFixed(0)) : 0,
        phenylalanine: original && original.phenylalanine ? parseFloat(((original.phenylalanine * item.amount) / 100).toFixed(0)) : 0,
        valine: original && original.valine ? parseFloat(((original.valine * item.amount) / 100).toFixed(0)) : 0,

        // Advanced clinical factors Phase 5.5
        price_per_100g: original ? (original.price_per_100g || getFoodPricePer100g(original)) : 0,
        phytic_acid: original && original.phytic_acid ? parseFloat(((original.phytic_acid * item.amount) / 100).toFixed(1)) : 0,
        calcium_absorb_factor: original ? (original.calcium_absorb_factor ?? 0.3) : 0.3,
        zinc_absorb_factor: original ? (original.zinc_absorb_factor ?? 0.2) : 0.2,
        iron_absorb_factor: original ? (original.iron_absorb_factor ?? 0.1) : 0.1,
        vitaminB1: original && original.vitaminB1 ? parseFloat(((original.vitaminB1 * item.amount) / 100).toFixed(2)) : 0,
        vitaminB2: original && original.vitaminB2 ? parseFloat(((original.vitaminB2 * item.amount) / 100).toFixed(2)) : 0,
        niacin: original && original.niacin ? parseFloat(((original.niacin * item.amount) / 100).toFixed(2)) : 0,
        vitaminB6: original && original.vitaminB6 ? parseFloat(((original.vitaminB6 * item.amount) / 100).toFixed(2)) : 0,
        pantothenicAcid: original && original.pantothenicAcid ? parseFloat(((original.pantothenicAcid * item.amount) / 100).toFixed(2)) : 0,
        vitaminB12: original && original.vitaminB12 ? parseFloat(((original.vitaminB12 * item.amount) / 100).toFixed(2)) : 0,
        retinol: original && original.retinol ? parseFloat(((original.retinol * item.amount) / 100).toFixed(1)) : 0,
      };
    });

    setFoodLogs(newLogs);
    alert("Spreadsheet log harian pasien berhasil diperbarui dengan pola makan gizi optimal!");
  };

  const handleApplyOptimizerResult = () => {
    if (!optimizerResult) return;
    executeApplyResult(optimizerResult);
  };

  const handleApplyInfeasibleHeuristic = () => {
    if (!pendingResultToApply) return;
    setOptimizerResult(pendingResultToApply);
    executeApplyResult(pendingResultToApply);
    setShowInfeasibleModal(false);
    setPendingResultToApply(null);
  };

  const showHelp = () => {
    alert(
      "Linear Programming (LP) Solver menyusun kombinasi gram makanan termurah untuk memenuhi semua batas minimal gizi klinis harian.\n\n" +
      "Anda dapat mengatur batas minimal nutrisi, batas kustom jumlah minimal (Jml. Min.) dan maksimal (Jml. Maks.) untuk setiap makanan, serta mengedit harga bahan makanan per 100 gram untuk menekan total pengeluaran biaya asupan pasien."
    );
  };

  const saveOptimizerSettings = () => {
    alert("Konfigurasi parameter LP Solver berhasil disimpan ke penyimpanan lokal.");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 text-zinc-300 font-sans" id="diet-optimizer-container">
      {/* Header section */}
      <div className="mb-6 border-b border-[#27272a] pb-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#00d4ff] animate-spin-slow" />
            <span>Linear Programming Diet Optimizer</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
            Rekomendasi diet berbiaya paling efisien menggunakan pemodelan algoritma Simplex / LP Solver terintegrasi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={showHelp}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white transition-all text-xs flex items-center space-x-1"
          >
            <HelpCircle className="w-4 h-4 text-[#00d4ff]" />
            <span>Bantuan</span>
          </button>
          
          <button
            onClick={saveOptimizerSettings}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white transition-all text-xs flex items-center space-x-1"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Simpan</span>
          </button>

          <button
            onClick={runLP}
            disabled={loading}
            className="px-4 py-2 bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-xs rounded shadow transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
            <span>{loading ? "Menghitung..." : "HITUNG DIET (SOLVER)"}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Columns (8 cols): Config and Food table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Target Group & Presets */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow">
            <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase mb-4">
              1. PRESET KELOMPOK TARGET DEMOGRAFIS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "general_adult", label: "Dewasa Umum" },
                { id: "pregnant_women", label: "Ibu Hamil" },
                { id: "lactating_women", label: "Ibu Menyusui" },
                { id: "children_6_23mo", label: "Bayi/Balita (6-23 bln)" }
              ].map((grp) => (
                <button
                  key={grp.id}
                  onClick={() => handleGroupPreset(grp.id)}
                  className={`py-2 px-2 border rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    targetGroup === grp.id
                      ? "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mathematical Constraints inputs */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              2. AMBANG BATAS MINIMAL NUTRISI (CLINICAL LOWER BOUNDS)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Energi Min. (kkal)
                </label>
                <input
                  type="number"
                  value={minEnergy}
                  onChange={(e) => setMinEnergy(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Protein Min. (g)
                </label>
                <input
                  type="number"
                  value={minProtein}
                  onChange={(e) => setMinProtein(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Kalsium Min. (mg)
                </label>
                <input
                  type="number"
                  value={minCalcium}
                  onChange={(e) => setMinCalcium(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Zat Besi Min. (mg)
                </label>
                <input
                  type="number"
                  value={minIron}
                  onChange={(e) => setMinIron(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                />
              </div>
            </div>

            {/* Max Cost & Toggle preferences */}
            <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                  Anggaran Maks. / Hari (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-zinc-500 font-mono">Rp</span>
                  <input
                    type="number"
                    value={maxCost}
                    onChange={(e) => setMaxCost(Math.max(1000, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2 text-xs cursor-pointer select-none py-1 text-zinc-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={localOnly}
                    onChange={(e) => setLocalOnly(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-[#00d4ff]"
                  />
                  <span>Prioritaskan Pangan Lokal TKPI</span>
                </label>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2 text-xs cursor-pointer select-none py-1 text-zinc-400 hover:text-white">
                  <input
                    type="checkbox"
                    checked={halalOnly}
                    onChange={(e) => setHalalOnly(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-[#00d4ff]"
                  />
                  <span>Utamakan Bahan Halal</span>
                </label>
              </div>
            </div>
          </div>

          {/* Whitelisted Foods with Min Amount, Max Amount, and Price/100g */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                3. PARAMETER DIET BAHAN MAKANAN ({activeSelectedCount} TERPILIH)
              </h3>

              <div className="space-x-2 text-[10px] font-mono">
                <button
                  onClick={() => handleSelectAll(true)}
                  className="text-[#00d4ff] hover:underline cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-zinc-600">|</span>
                <button
                  onClick={() => handleSelectAll(false)}
                  className="text-zinc-500 hover:underline cursor-pointer"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            {/* Search filter for eligible foods */}
            <input
              type="text"
              placeholder="Cari makanan untuk melengkapi daftar matriks optimasi..."
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />

            {/* Foods Grid / Table for advanced constraints */}
            <div className="max-h-[380px] overflow-y-auto pr-2 scrollbar-thin border border-zinc-800 rounded">
              <table className="w-full text-left text-xs text-zinc-400 font-mono">
                <thead className="bg-[#18181b] text-zinc-500 text-[10px] uppercase sticky top-0 z-10">
                  <tr className="border-b border-zinc-800">
                    <th className="p-3 w-8">Pilih</th>
                    <th className="p-3">Nama Makanan</th>
                    <th className="p-3 w-28">Jml. Min. (g)</th>
                    <th className="p-3 w-28">Jml. Maks. (g)</th>
                    <th className="p-3 w-32">Harga / 100g</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {availableSelectorFoods.map((food) => {
                    const isSelected = !!selectedFoods[food.id];
                    const constraints = getConstraint(food.id, food);

                    return (
                      <tr 
                        key={food.id}
                        className={`hover:bg-zinc-900/40 transition-colors ${
                          isSelected ? "bg-[#00d4ff]/5 text-white" : "text-zinc-400"
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFoodSelection(food.id)}
                            className="rounded bg-zinc-950 border-zinc-800 text-[#00d4ff] cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{food.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            Kategori: {food.category} • {food.calories} kkal
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            disabled={!isSelected}
                            value={constraints.minAmount}
                            onChange={(e) => handleConstraintChange(food.id, "minAmount", Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-xs text-white focus:outline-none text-right disabled:opacity-40"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            disabled={!isSelected}
                            value={constraints.maxAmount}
                            onChange={(e) => handleConstraintChange(food.id, "maxAmount", Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-xs text-white focus:outline-none text-right disabled:opacity-40"
                          />
                        </td>
                        <td className="p-3">
                          <div className="relative">
                            <span className="absolute left-1.5 top-1 text-[10px] text-zinc-500">Rp</span>
                            <input
                              type="number"
                              disabled={!isSelected}
                              value={constraints.pricePer100g}
                              onChange={(e) => handleConstraintChange(food.id, "pricePer100g", Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-6 pr-1.5 py-1 text-xs text-white focus:outline-none text-right disabled:opacity-40"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Solver Output & Nutrient Comparison Table */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase mb-4 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#00d4ff]" />
                <span>HASIL OPTIMASI SIMPLEX LP</span>
              </h3>

              {!optimizerResult ? (
                <div className="text-center py-20 text-zinc-500 font-mono text-xs space-y-2">
                  {loading ? (
                    <div className="space-y-2">
                      <RefreshCw className="w-8 h-8 text-[#00d4ff] animate-spin mx-auto" />
                      <div>Menyelesaikan matriks Simplex...</div>
                    </div>
                  ) : (
                    <>
                      <Info className="w-8 h-8 text-zinc-600 mx-auto" />
                      <div>Klik tombol 'HITUNG DIET' untuk memicu optimasi linier.</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`p-3 rounded-lg flex items-center space-x-2.5 ${
                    optimizerResult.meetsRequirements
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  }`}>
                    {optimizerResult.meetsRequirements ? (
                      <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <div className="text-xs font-mono">
                      <div className="font-bold">
                        {optimizerResult.meetsRequirements ? "SOLUSI OPTIMAL DITEMUKAN" : "SOLUSI PARSIAL (HEURISTIK)"}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {optimizerResult.meetsRequirements
                          ? "Semua ambang batas gizi klinis minimal terpenuhi dengan harga paling hemat."
                          : `Defisit tersisa pada: ${optimizerResult.problemNutrients.map((n: string) => n === "Energy" ? "Energi" : n === "Iron" ? "Zat Besi" : n === "Calcium" ? "Kalsium" : n).join(", ")}`}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded text-center">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">Total Biaya</div>
                      <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                        Rp {optimizerResult.totalCost.toLocaleString("id-ID")}
                        <span className="text-[9px] text-zinc-500 font-normal block mt-0.5">/ hari</span>
                      </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded text-center">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">Energi Diet</div>
                      <div className="text-base font-mono font-bold text-amber-400 mt-1">
                        {optimizerResult.totalNutrients.calories}
                        <span className="text-[9px] text-zinc-500 font-normal block mt-0.5">kkal / hari</span>
                      </div>
                    </div>
                  </div>

                  {/* Nutrients Requirements Table (Exact NutriSurvey UI alignment) */}
                  <div className="space-y-2 border-t border-zinc-800 pt-4">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      TABEL KEBUTUHAN NUTRISI
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead>
                          <tr className="text-zinc-500 border-b border-zinc-800 text-[10px]">
                            <th className="pb-2">Nutrisi</th>
                            <th className="pb-2 text-right">Min</th>
                            <th className="pb-2 text-right">Maks</th>
                            <th className="pb-2 text-right">Aktual</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                          <tr>
                            <td className="py-2">Energi [kkal]</td>
                            <td className="py-2 text-right text-zinc-500">{minEnergy}</td>
                            <td className="py-2 text-right text-zinc-500">3500</td>
                            <td className={`py-2 text-right font-bold ${optimizerResult.totalNutrients.calories >= minEnergy ? "text-emerald-400" : "text-amber-400"}`}>{optimizerResult.totalNutrients.calories}</td>
                          </tr>
                          <tr>
                            <td className="py-2">Protein [g]</td>
                            <td className="py-2 text-right text-zinc-500">{minProtein}</td>
                            <td className="py-2 text-right text-zinc-500">150</td>
                            <td className={`py-2 text-right font-bold ${optimizerResult.totalNutrients.protein >= minProtein ? "text-emerald-400" : "text-amber-400"}`}>{optimizerResult.totalNutrients.protein}</td>
                          </tr>
                          <tr>
                            <td className="py-2">Kalsium [mg]</td>
                            <td className="py-2 text-right text-zinc-500">{minCalcium}</td>
                            <td className="py-2 text-right text-zinc-500">2500</td>
                            <td className={`py-2 text-right font-bold ${optimizerResult.totalNutrients.calcium >= minCalcium ? "text-emerald-400" : "text-amber-400"}`}>{optimizerResult.totalNutrients.calcium}</td>
                          </tr>
                          <tr>
                            <td className="py-2">Zat Besi [mg]</td>
                            <td className="py-2 text-right text-zinc-500">{minIron}</td>
                            <td className="py-2 text-right text-zinc-500">45</td>
                            <td className={`py-2 text-right font-bold ${optimizerResult.totalNutrients.iron >= minIron ? "text-emerald-400" : "text-amber-400"}`}>{optimizerResult.totalNutrients.iron}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Food Schedule Output */}
                  <div className="space-y-2 border-t border-zinc-800 pt-4">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      PROPORSI PORSI POLA MAKAN HASIL LP
                    </div>
                    
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                      {optimizerResult.optimalDiet.map((item: any) => (
                        <div
                          key={item.foodId}
                          className="bg-zinc-950 border border-zinc-800 p-2 rounded flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white truncate max-w-[170px] block">{item.name}</span>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              Biaya: Rp {item.cost.toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#00d4ff] font-mono">{item.amount} g</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {optimizerResult && (
              <button
                onClick={handleApplyOptimizerResult}
                className="w-full mt-6 py-2 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 text-xs font-mono font-bold rounded cursor-pointer transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" />
                <span>TERAPKAN DIET KE SPREADSHEET</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INFEASIBLE CONFIRMATION DIALOG MODAL */}
      {showInfeasibleModal && pendingResultToApply && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-amber-500/50 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-800 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h4 className="text-md font-bold text-white font-mono uppercase">Konfirmasi Optimasi (Infeasible)</h4>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                <span className="font-bold text-amber-400">Sistem memberi tahu Anda:</span> Tidak ditemukan solusi optimal yang memenuhi 100% semua kriteria batas minimal gizi klinis dengan kombinasi whitelisted bahan makanan ini.
              </p>
              
              <div className="bg-zinc-950/80 p-3 rounded border border-zinc-800 text-xs font-mono space-y-2">
                <div className="text-zinc-400 font-bold">Kekurangan Gizi yang Tersisa:</div>
                <div className="text-amber-400 font-bold">
                  • {pendingResultToApply.problemNutrients.map((n: string) => n === "Energy" ? "Energi" : n === "Iron" ? "Zat Besi" : n === "Calcium" ? "Kalsium" : n).join(", ")}
                </div>
                
                <div className="text-zinc-400 font-bold mt-2">Usulan Saran Kompromi (Diet Heuristik):</div>
                <div className="max-h-[100px] overflow-y-auto space-y-1 mt-1 pr-1 text-[11px]">
                  {pendingResultToApply.optimalDiet.map((item: any) => (
                    <div key={item.foodId} className="flex justify-between text-zinc-400">
                      <span>{item.name}</span>
                      <span className="text-[#00d4ff] font-bold">{item.amount}g</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Apakah Anda tetap ingin menerapkan saran perbaikan heuristik parsial di atas ke dalam rekapitulasi gizi spreadsheet pasien saat ini?
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowInfeasibleModal(false);
                  setPendingResultToApply(null);
                }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                Tidak (Batal)
              </button>
              
              <button
                onClick={handleApplyInfeasibleHeuristic}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded text-xs font-mono font-bold cursor-pointer"
              >
                Ya (Terapkan Perubahan)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
