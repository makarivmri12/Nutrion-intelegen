import React, { useState, useMemo } from "react";
import { useNutriStore } from "../../store/useNutriStore";
import { ChevronDown, ChevronRight, CheckSquare, Square, Info, Calendar } from "lucide-react";

interface DietHistoryFood {
  id: string;
  name: string;
  defaultGrams: number;
  calories: number; // per 100g
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodGroup {
  id: string;
  name: string;
  foods: DietHistoryFood[];
}

interface MealSection {
  id: string;
  name: string;
  groups: FoodGroup[];
}

const DIET_HISTORY_DATA: MealSection[] = [
  {
    id: "breakfast",
    name: "Breakfast Pattern",
    groups: [
      {
        id: "bf-bevs",
        name: "Beverages",
        foods: [
          { id: "dh-1", name: "Teh Manis (Sweet Tea)", defaultGrams: 200, calories: 30, protein: 0, carbs: 7.5, fat: 0 },
          { id: "dh-2", name: "Kopi Susu (Milk Coffee)", defaultGrams: 200, calories: 75, protein: 1.5, carbs: 11, fat: 2 },
          { id: "dh-3", name: "Fresh Juice (Jus Jeruk)", defaultGrams: 200, calories: 45, protein: 0.5, carbs: 10.4, fat: 0.1 }
        ]
      },
      {
        id: "bf-grains",
        name: "Bread & Cereals",
        foods: [
          { id: "dh-4", name: "Roti Tawar (Toast)", defaultGrams: 60, calories: 265, protein: 9, carbs: 49, fat: 3.2 },
          { id: "dh-5", name: "Bubur Ayam (Chicken Porridge)", defaultGrams: 250, calories: 85, protein: 3.2, carbs: 12, fat: 2.5 },
          { id: "dh-6", name: "Oatmeal Bowl", defaultGrams: 150, calories: 70, protein: 2.5, carbs: 12, fat: 1.2 }
        ]
      },
      {
        id: "bf-proteins",
        name: "Eggs & Sides",
        foods: [
          { id: "dh-7", name: "Telur Rebus (Boiled Egg)", defaultGrams: 60, calories: 155, protein: 13, carbs: 1.1, fat: 11 },
          { id: "dh-8", name: "Omelette (Telur Dadar)", defaultGrams: 75, calories: 196, protein: 12, carbs: 1.2, fat: 15.4 }
        ]
      }
    ]
  },
  {
    id: "lunch",
    name: "Lunch Pattern",
    groups: [
      {
        id: "lh-staples",
        name: "Staples & Grains",
        foods: [
          { id: "dh-9", name: "Nasi Putih (Steamed Rice)", defaultGrams: 150, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
          { id: "dh-10", name: "Nasi Merah (Brown Rice)", defaultGrams: 150, calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
          { id: "dh-11", name: "Mie Goreng (Fried Noodles)", defaultGrams: 150, calories: 220, protein: 4.8, carbs: 32, fat: 8.5 }
        ]
      },
      {
        id: "lh-proteins",
        name: "Meats & Seafood",
        foods: [
          { id: "dh-12", name: "Ayam Goreng (Fried Chicken)", defaultGrams: 100, calories: 246, protein: 25, carbs: 0, fat: 16 },
          { id: "dh-13", name: "Daging Rendang (Beef Rendang)", defaultGrams: 80, calories: 194, protein: 19.8, carbs: 4.5, fat: 11.2 },
          { id: "dh-14", name: "Ikan Lele (Fried Catfish)", defaultGrams: 120, calories: 232, protein: 18.5, carbs: 0, fat: 17.5 }
        ]
      },
      {
        id: "lh-vegs",
        name: "Vegetable Dishes",
        foods: [
          { id: "dh-15", name: "Kangkung Cah (Water Spinach)", defaultGrams: 100, calories: 65, protein: 2.5, carbs: 4.2, fat: 4.8 },
          { id: "dh-16", name: "Sayur Sop (Vegetable Soup)", defaultGrams: 150, calories: 45, protein: 1.5, carbs: 8.5, fat: 0.5 },
          { id: "dh-17", name: "Sayur Asem (Tamarind Soup)", defaultGrams: 150, calories: 50, protein: 1.2, carbs: 10.5, fat: 0.8 }
        ]
      }
    ]
  },
  {
    id: "dinner",
    name: "Dinner Pattern",
    groups: [
      {
        id: "dn-staples",
        name: "Staples & Grains",
        foods: [
          { id: "dh-18", name: "Nasi Putih (Steamed Rice)", defaultGrams: 150, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
          { id: "dh-19", name: "Lontong / Ketupat", defaultGrams: 120, calories: 144, protein: 2.4, carbs: 31.5, fat: 0.2 }
        ]
      },
      {
        id: "dn-proteins",
        name: "Meats & Plant Proteins",
        foods: [
          { id: "dh-20", name: "Ayam Bakar (Grilled Chicken)", defaultGrams: 100, calories: 198, protein: 26.5, carbs: 2.1, fat: 9.5 },
          { id: "dh-21", name: "Tempe Goreng (Fried Tempeh)", defaultGrams: 80, calories: 220, protein: 15, carbs: 11.2, fat: 14.2 },
          { id: "dh-22", name: "Tahu Bacem (Stewed Tofu)", defaultGrams: 80, calories: 140, protein: 10.5, carbs: 8, fat: 6.5 }
        ]
      },
      {
        id: "dn-vegs",
        name: "Soups & Greens",
        foods: [
          { id: "dh-23", name: "Sayur Bayam (Spinach Soup)", defaultGrams: 150, calories: 25, protein: 1.8, carbs: 3.5, fat: 0.2 },
          { id: "dh-24", name: "Capcay (Stir-fry Mixed Vegetables)", defaultGrams: 120, calories: 75, protein: 3, carbs: 6.8, fat: 4.5 }
        ]
      }
    ]
  },
  {
    id: "snacks",
    name: "Snacks & Refreshments",
    groups: [
      {
        id: "sn-am",
        name: "Morning Snacks",
        foods: [
          { id: "dh-25", name: "Bakwan Sayur (Veg Fritter)", defaultGrams: 80, calories: 280, protein: 3.5, carbs: 32.4, fat: 15.6 },
          { id: "dh-26", name: "Pisang Goreng (Fried Banana)", defaultGrams: 100, calories: 252, protein: 1.8, carbs: 42.1, fat: 9.5 }
        ]
      },
      {
        id: "sn-pm",
        name: "Afternoon Snacks",
        foods: [
          { id: "dh-27", name: "Martabak Manis", defaultGrams: 120, calories: 345, protein: 7.2, carbs: 48, fat: 14.5 },
          { id: "dh-28", name: "Kerupuk Putih (Crackers)", defaultGrams: 20, calories: 476, protein: 1, carbs: 68, fat: 22 },
          { id: "dh-29", name: "Fresh Fruits (Pepaya/Melon)", defaultGrams: 120, calories: 40, protein: 0.5, carbs: 10, fat: 0.2 }
        ]
      }
    ]
  }
];

interface SelectionState {
  selected: boolean;
  frequency: number; // 0-7 days/week
  portionGrams: number;
  cookingMethod: "Fried" | "Steamed" | "Grilled" | "Boiled" | "N/A";
}

export default function DietHistory() {
  const [timePeriod, setTimePeriod] = useState<string>("Typical week in last month");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: false,
    snacks: false
  });

  // Keep state for all foods in diet history
  const [selections, setSelections] = useState<Record<string, SelectionState>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleSelectionChange = (foodId: string, field: keyof SelectionState, value: any) => {
    setSelections(prev => {
      const current = prev[foodId] || { selected: false, frequency: 3, portionGrams: 100, cookingMethod: "N/A" };
      const updated = { ...current, [field]: value };
      
      // Auto-toggle 'selected' to true if modifying details
      if (field !== "selected") {
        updated.selected = true;
      }
      return { ...prev, [foodId]: updated };
    });
  };

  const toggleFoodSelected = (foodId: string, defaultGrams: number) => {
    setSelections(prev => {
      const current = prev[foodId] || { selected: false, frequency: 3, portionGrams: defaultGrams, cookingMethod: "N/A" };
      return {
        ...prev,
        [foodId]: {
          ...current,
          selected: !current.selected,
          portionGrams: current.portionGrams || defaultGrams
        }
      };
    });
  };

  // Aggregate weekly calculations
  const weeklyAggregation = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let selectedCount = 0;

    Object.entries(selections).forEach(([foodId, stateVal]) => {
      const state = stateVal as SelectionState;
      if (!state.selected || state.frequency <= 0) return;
      
      // Find food details
      let foundFood: DietHistoryFood | null = null;
      for (const section of DIET_HISTORY_DATA) {
        for (const group of section.groups) {
          const f = group.foods.find(item => item.id === foodId);
          if (f) {
            foundFood = f;
            break;
          }
        }
        if (foundFood) break;
      }

      if (foundFood) {
        selectedCount++;
        // Formula: Weekly intake = (frequency per week) * portion_size * contentPer100g / 100
        const weeklyWeightGrams = state.frequency * state.portionGrams;
        const scale = weeklyWeightGrams / 100;

        // Apply a small coefficient multiplier based on cooking method
        // e.g., Frying adds additional lipid values
        let lipidMultiplier = 1.0;
        let calorieMultiplier = 1.0;
        if (state.cookingMethod === "Fried") {
          lipidMultiplier = 1.4;
          calorieMultiplier = 1.2;
        } else if (state.cookingMethod === "Steamed" || state.cookingMethod === "Boiled") {
          lipidMultiplier = 0.9;
          calorieMultiplier = 0.95;
        }

        calories += (foundFood.calories * scale) * calorieMultiplier;
        protein += foundFood.protein * scale;
        carbs += foundFood.carbs * scale;
        fat += (foundFood.fat * scale) * lipidMultiplier;
      }
    });

    return {
      weeklyCalories: Math.round(calories),
      weeklyProtein: parseFloat(protein.toFixed(1)),
      weeklyCarbs: parseFloat(carbs.toFixed(1)),
      weeklyFat: parseFloat(fat.toFixed(1)),
      dailyAverageCalories: Math.round(calories / 7),
      dailyAverageProtein: parseFloat((protein / 7).toFixed(1)),
      dailyAverageCarbs: parseFloat((carbs / 7).toFixed(1)),
      dailyAverageFat: parseFloat((fat / 7).toFixed(1)),
      selectedCount
    };
  }, [selections]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 text-zinc-300 font-sans" id="diet-history-container">
      {/* Header section */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span className="text-[#7c3aed]">Diet History Assessment (1-3 Months)</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
            Sistem tracking pola makan berkala yang menilai kecenderungan diet jangka menengah pasien.
          </p>
        </div>

        {/* Time period selector */}
        <div className="flex items-center space-x-2 bg-[#121212] border border-[#27272a] rounded px-3 py-1">
          <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
          <span className="text-xs text-zinc-400 font-mono">Assessment Period:</span>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-mono font-medium"
          >
            <option value="Typical week in last month">Typical week in last month</option>
            <option value="Typical week in last 2 months">Typical week in last 2 months</option>
            <option value="Typical week in last 3 months">Typical week in last 3 months</option>
          </select>
        </div>
      </div>

      {/* Grid: Tree Navigator left, Weekly stats on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tree View Accordion of Meals */}
        <div className="lg:col-span-2 space-y-4">
          {DIET_HISTORY_DATA.map((section) => {
            const isExpanded = expandedSections[section.id];
            return (
              <div
                key={section.id}
                className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden shadow-md"
              >
                {/* Header of Section */}
                <div
                  onClick={() => toggleSection(section.id)}
                  className="bg-[#1a1a1a] p-4 flex items-center justify-between cursor-pointer border-b border-[#27272a]"
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#7c3aed]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#a1a1aa]" />
                    )}
                    <span className="text-sm font-bold text-white tracking-wide">{section.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                    {section.groups.length} food groups
                  </span>
                </div>

                {/* Body / Child Food Groups */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {section.groups.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <h4 className="text-[11px] font-mono tracking-wider text-[#7c3aed] uppercase font-bold pl-1">
                          {group.name}
                        </h4>

                        <div className="space-y-2 bg-[#0c0c0d] rounded-lg border border-[#27272a] p-3">
                          {group.foods.map((food) => {
                            const state = selections[food.id] || {
                              selected: false,
                              frequency: 3,
                              portionGrams: food.defaultGrams,
                              cookingMethod: "N/A"
                            };

                            return (
                              <div
                                key={food.id}
                                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-2.5 rounded transition-all ${
                                  state.selected
                                    ? "bg-[#7c3aed]/5 border border-[#7c3aed]/20"
                                    : "bg-[#141415] border border-zinc-900 hover:border-zinc-800"
                                }`}
                              >
                                {/* Checkbox & Name */}
                                <div
                                  onClick={() => toggleFoodSelected(food.id, food.defaultGrams)}
                                  className="flex items-center space-x-3 cursor-pointer select-none"
                                >
                                  {state.selected ? (
                                    <CheckSquare className="w-4 h-4 text-[#7c3aed] flex-shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                  )}
                                  <div>
                                    <div className="text-xs font-semibold text-white">{food.name}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                      {food.calories} kcal/100g • P {food.protein}g • F {food.fat}g
                                    </div>
                                  </div>
                                </div>

                                {/* Form settings: displayed if selected */}
                                {state.selected && (
                                  <div className="flex flex-wrap items-center gap-3 md:self-center pl-7 md:pl-0">
                                    {/* Days per week frequency */}
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] text-zinc-500 font-mono">Freq:</span>
                                      <select
                                        value={state.frequency}
                                        onChange={(e) =>
                                          handleSelectionChange(food.id, "frequency", parseInt(e.target.value) || 0)
                                        }
                                        className="bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-0.5 text-[11px] text-white font-mono"
                                      >
                                        {[...Array(8).keys()].map((day) => (
                                          <option key={day} value={day}>
                                            {day} d/wk
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Gram typical portion */}
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] text-zinc-500 font-mono">Portion:</span>
                                      <input
                                        type="number"
                                        min={10}
                                        max={1000}
                                        value={state.portionGrams}
                                        onChange={(e) =>
                                          handleSelectionChange(
                                            food.id,
                                            "portionGrams",
                                            Math.max(10, parseInt(e.target.value) || 10)
                                          )
                                        }
                                        className="w-14 bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-0.5 text-center text-[11px] text-white font-mono"
                                      />
                                      <span className="text-[10px] text-zinc-500 font-mono">g</span>
                                    </div>

                                    {/* Cooking Method selector */}
                                    <div className="flex items-center space-x-1">
                                      <span className="text-[10px] text-zinc-500 font-mono">Cook:</span>
                                      <select
                                        value={state.cookingMethod}
                                        onChange={(e) =>
                                          handleSelectionChange(food.id, "cookingMethod", e.target.value)
                                        }
                                        className="bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono"
                                      >
                                        <option value="N/A">Raw/Natural</option>
                                        <option value="Boiled">Boiled</option>
                                        <option value="Steamed">Steamed</option>
                                        <option value="Fried">Fried</option>
                                        <option value="Grilled">Grilled</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: Diet History Weekly Aggregations */}
        <div className="space-y-6">
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2 font-mono">
              <span>WEEKLY COMPREHENSIVE OUTCOME</span>
            </h3>

            <div className="space-y-4">
              {/* Total calories */}
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-zinc-800 text-center">
                <div className="text-[10.5px] text-zinc-500 font-mono uppercase tracking-wider">Weekly Caloric Delivery</div>
                <div className="text-2xl font-mono font-bold text-purple-400 mt-1">
                  {weeklyAggregation.weeklyCalories}{" "}
                  <span className="text-xs text-zinc-500 font-mono">kcal / week</span>
                </div>
                <div className="text-[10.5px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800">
                  Daily Average: <strong className="text-amber-400">{weeklyAggregation.dailyAverageCalories} kcal/day</strong>
                </div>
              </div>

              {/* Macros Breakdown Weekly */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-400">Weekly Protein Intake</span>
                    <span className="text-purple-400 font-semibold">{weeklyAggregation.weeklyProtein} g</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 text-right">
                    Avg. {weeklyAggregation.dailyAverageProtein} g / day
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-400">Weekly Carbohydrates</span>
                    <span className="text-[#00d4ff] font-semibold">{weeklyAggregation.weeklyCarbs} g</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 text-right">
                    Avg. {weeklyAggregation.dailyAverageCarbs} g / day
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-400">Weekly Lipids (Fats)</span>
                    <span className="text-rose-400 font-semibold">{weeklyAggregation.weeklyFat} g</span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 text-right">
                    Avg. {weeklyAggregation.dailyAverageFat} g / day
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-[#7c3aed] flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-[#a1a1aa] leading-relaxed font-mono">
                  <strong>Clinical Assessment Info:</strong> Diet History assesses regular weekly frequencies. If lipids/calories look higher than standard guidelines, check the cooking methods selected. Frying options increase the calorie coefficients by 20% and fat coefficients by 40%.
                </div>
              </div>
            </div>
          </div>

          {/* Active selections audit */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-3 font-mono">
              TYPICAL HABITS RECONCILIATION
            </h3>

            {weeklyAggregation.selectedCount === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">
                Centang item di bagian kiri untuk menstimulasi visualisasi kecenderungan asupan.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {Object.entries(selections).map(([foodId, stateVal]) => {
                  const state = stateVal as SelectionState;
                  if (!state.selected) return null;
                  
                  // find food name
                  let fName = "";
                  for (const section of DIET_HISTORY_DATA) {
                    for (const g of section.groups) {
                      const f = g.foods.find(item => item.id === foodId);
                      if (f) {
                        fName = f.name;
                        break;
                      }
                    }
                  }

                  return (
                    <div key={foodId} className="bg-[#1a1a1a] p-2 rounded text-xs border border-zinc-800">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white truncate max-w-[170px]">{fName}</span>
                        <span className="text-[#7c3aed] font-mono font-bold">{state.frequency} days/wk</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                        <span>Portion: {state.portionGrams}g</span>
                        <span>Cooking: {state.cookingMethod}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
