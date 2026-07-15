import React, { useState, useMemo } from "react";
import { useNutriStore } from "../../store/useNutriStore";
import { FoodItem } from "../../types";
import { 
  FolderHeart, 
  Plus, 
  Trash2, 
  Calculator, 
  Check, 
  AlertCircle, 
  Flame, 
  Sparkles, 
  Scale
} from "lucide-react";

interface RecipeIngredient {
  foodId: string;
  name: string;
  weightGrams: number;
  // Hold full nutrients for raw calculation
  foodItem: FoodItem;
}

export default function RecipeEditor() {
  const { foodDatabase, addCustomFoodItem } = useNutriStore();

  // Recipe states
  const [recipeName, setRecipeName] = useState("");
  const [portions, setPortions] = useState(4);
  const [yieldFactor, setYieldFactor] = useState(1.0); // cooked weight / raw weight
  const [vitaminCRetention, setVitaminCRetention] = useState(0.70); // 70% retained after cooking
  const [vitaminARetention, setVitaminARetention] = useState(0.85); // 85% retained after cooking
  const [folateRetention, setFolateRetention] = useState(0.80); // 80% retained after cooking

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  // Selection list search states
  const [searchIngredient, setSearchIngredient] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [ingredientWeight, setIngredientWeight] = useState(100);

  // Status message
  const [statusMessage, setStatusMessage] = useState("");

  // Filter food database for ingredient picker
  const filteredFoodsForPicker = useMemo(() => {
    if (!searchIngredient.trim()) return [];
    return foodDatabase.filter(f => 
      f.name.toLowerCase().includes(searchIngredient.toLowerCase())
    ).slice(0, 5);
  }, [foodDatabase, searchIngredient]);

  const handleAddIngredient = () => {
    const food = foodDatabase.find(f => f.id === selectedFoodId);
    if (!food || ingredientWeight <= 0) return;

    const newIng: RecipeIngredient = {
      foodId: food.id,
      name: food.name,
      weightGrams: ingredientWeight,
      foodItem: food
    };

    setRecipeIngredients([...recipeIngredients, newIng]);
    setSelectedFoodId("");
    setSearchIngredient("");
    setIngredientWeight(100);
  };

  const handleRemoveIngredient = (idx: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx));
  };

  // Recipe Calculations Engine
  const recipeNutrients = useMemo(() => {
    // 1. Raw Weight
    const rawWeightGrams = recipeIngredients.reduce((sum, ing) => sum + ing.weightGrams, 0);
    
    // 2. Cooked weight = Raw weight * Yield Factor
    const cookedWeightGrams = rawWeightGrams * yieldFactor;

    // 3. Accumulate raw nutrients
    let rawCalories = 0;
    let rawProtein = 0;
    let rawCarbs = 0;
    let rawFat = 0;
    let rawFiber = 0;
    let rawSodium = 0;
    let rawCalcium = 0;
    let rawIron = 0;
    let rawVitaminC = 0;
    let rawFolate = 0;
    let rawVitaminA = 0;
    let rawWater = 0;
    let rawSugar = 0;

    recipeIngredients.forEach(ing => {
      const scale = ing.weightGrams / 100;
      rawCalories += ing.foodItem.calories * scale;
      rawProtein += ing.foodItem.protein * scale;
      rawCarbs += ing.foodItem.carbs * scale;
      rawFat += ing.foodItem.fat * scale;
      rawFiber += ing.foodItem.fiber * scale;
      rawSodium += ing.foodItem.sodium * scale;
      rawCalcium += ing.foodItem.calcium * scale;
      rawIron += ing.foodItem.iron * scale;
      rawVitaminC += ing.foodItem.vitaminC * scale;
      rawFolate += (ing.foodItem.folate || 0) * scale;
      rawVitaminA += (ing.foodItem.vitaminA || 0) * scale;
      rawWater += (ing.foodItem.water || 0) * scale;
      rawSugar += (ing.foodItem.sugar || 0) * scale;
    });

    // 4. Apply Retention Factors to Raw Vitamins
    const cookedVitaminC = rawVitaminC * vitaminCRetention;
    const cookedVitaminA = rawVitaminA * vitaminARetention;
    const cookedFolate = rawFolate * folateRetention;

    // 5. Cooked Nutrient concentration (per 100g of cooked recipe)
    // Formula: (Total Raw Nutrient / Cooked Weight) * 100
    const cookedScale = cookedWeightGrams > 0 ? (100 / cookedWeightGrams) : 0;

    const per100g = {
      calories: Math.round(rawCalories * cookedScale),
      protein: parseFloat((rawProtein * cookedScale).toFixed(1)),
      carbs: parseFloat((rawCarbs * cookedScale).toFixed(1)),
      fat: parseFloat((rawFat * cookedScale).toFixed(1)),
      fiber: parseFloat((rawFiber * cookedScale).toFixed(1)),
      sodium: Math.round(rawSodium * cookedScale),
      calcium: Math.round(rawCalcium * cookedScale),
      iron: parseFloat((rawIron * cookedScale).toFixed(1)),
      vitaminC: parseFloat((cookedVitaminC * cookedScale).toFixed(1)),
      folate: Math.round(cookedFolate * cookedScale),
      vitaminA: Math.round(cookedVitaminA * cookedScale),
      water: parseFloat((rawWater * cookedScale).toFixed(1)),
      sugar: parseFloat((rawSugar * cookedScale).toFixed(1)),
    };

    // 6. Nutrient values per Single Serving/Portion
    const perPortion = {
      calories: portions > 0 ? Math.round(rawCalories / portions) : 0,
      protein: portions > 0 ? parseFloat((rawProtein / portions).toFixed(1)) : 0,
      carbs: portions > 0 ? parseFloat((rawCarbs / portions).toFixed(1)) : 0,
      fat: portions > 0 ? parseFloat((rawFat / portions).toFixed(1)) : 0,
      fiber: portions > 0 ? parseFloat((rawFiber / portions).toFixed(1)) : 0,
      sodium: portions > 0 ? Math.round(rawSodium / portions) : 0,
      calcium: portions > 0 ? Math.round(rawCalcium / portions) : 0,
      iron: portions > 0 ? parseFloat((rawIron / portions).toFixed(1)) : 0,
      vitaminC: portions > 0 ? parseFloat((cookedVitaminC / portions).toFixed(1)) : 0,
      folate: portions > 0 ? Math.round(cookedFolate / portions) : 0,
      vitaminA: portions > 0 ? Math.round(cookedVitaminA / portions) : 0,
    };

    return {
      rawWeightGrams,
      cookedWeightGrams,
      per100g,
      perPortion
    };
  }, [recipeIngredients, yieldFactor, vitaminCRetention, vitaminARetention, folateRetention, portions]);

  // Publish as standard Custom Food Database Item
  const handlePublishRecipe = () => {
    if (!recipeName.trim()) {
      setStatusMessage("Error: Please provide a descriptive recipe name.");
      return;
    }
    if (recipeIngredients.length === 0) {
      setStatusMessage("Error: Please add at least one ingredient to the recipe.");
      return;
    }

    const newFood: Omit<FoodItem, "id"> = {
      code: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `[Resep] ${recipeName.trim()}`,
      category: "General",
      calories: recipeNutrients.per100g.calories,
      protein: recipeNutrients.per100g.protein,
      carbs: recipeNutrients.per100g.carbs,
      fat: recipeNutrients.per100g.fat,
      fiber: recipeNutrients.per100g.fiber,
      sodium: recipeNutrients.per100g.sodium,
      calcium: recipeNutrients.per100g.calcium,
      iron: recipeNutrients.per100g.iron,
      vitaminC: recipeNutrients.per100g.vitaminC,
      potassium: 0,
      magnesium: 0,
      zinc: 0,
      folate: recipeNutrients.per100g.folate,
      vitaminA: recipeNutrients.per100g.vitaminA,
      water: recipeNutrients.per100g.water,
      sugar: recipeNutrients.per100g.sugar,
      databaseSource: "INDONESIAN"
    };

    addCustomFoodItem(newFood);
    setStatusMessage(`Successfully published '${recipeName}' as custom food item into database!`);
    
    // Clear recipe
    setRecipeName("");
    setRecipeIngredients([]);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 font-sans text-zinc-300" id="recipe-editor-container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center space-x-2">
            <FolderHeart className="w-4 h-4 text-[#00d4ff]" />
            <span>Advanced Recipe Constructor & Yield Analyzer</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Specify raw recipes, apply cooking loss retention rates, configure portion sizes, and publish to the food database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Recipe Setup */}
        <div className="space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Recipe Config Setup
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Recipe Name *</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="e.g. Sop Ayam Kampung Rendah Lemak"
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Servings / Portions</label>
                  <input
                    type="number"
                    min="1"
                    value={portions}
                    onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Yield Factor (Cooked / Raw)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={yieldFactor}
                    onChange={(e) => setYieldFactor(Math.max(0.1, parseFloat(e.target.value) || 1.0))}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                    title="Cooked recipe weight divided by raw weight. Values < 1 imply moisture loss (baking/frying). Values > 1 imply water absorption (rice/boiling)."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cooking Retention Factors */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2 flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Cooking Retention Factors</span>
            </span>
            <p className="text-[10px] text-zinc-500 leading-normal mb-3">
              Configure the percentage of heat-sensitive micronutrients that survive the thermal processing.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>Vitamin C Retention</span>
                  <span className="text-rose-400">{Math.round(vitaminCRetention * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={vitaminCRetention}
                  onChange={(e) => setVitaminCRetention(parseFloat(e.target.value))}
                  className="w-full accent-[#00d4ff] bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>Vitamin A Retention</span>
                  <span className="text-amber-400">{Math.round(vitaminARetention * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={vitaminARetention}
                  onChange={(e) => setVitaminARetention(parseFloat(e.target.value))}
                  className="w-full accent-[#00d4ff] bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>Folate (B9) Retention</span>
                  <span className="text-purple-400">{Math.round(folateRetention * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={folateRetention}
                  onChange={(e) => setFolateRetention(parseFloat(e.target.value))}
                  className="w-full accent-[#00d4ff] bg-zinc-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Add Ingredients and Real-time Yield analysis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block border-b border-zinc-800 pb-2">
              Recipe Ingredients Sheet
            </span>

            {/* Select ingredient input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="relative">
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Search Food DB</label>
                <input
                  type="text"
                  value={searchIngredient}
                  onChange={(e) => setSearchIngredient(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />

                {/* Auto complete list */}
                {filteredFoodsForPicker.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-[#18181b] border border-zinc-800 rounded shadow-xl z-50 overflow-hidden divide-y divide-zinc-900">
                    {filteredFoodsForPicker.map((food) => (
                      <div
                        key={food.id}
                        onClick={() => {
                          setSelectedFoodId(food.id);
                          setSearchIngredient(food.name);
                        }}
                        className={`p-2 text-xs font-mono transition-colors cursor-pointer text-left truncate ${
                          selectedFoodId === food.id ? "bg-[#00d4ff]/10 text-white" : "hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {food.name} ({food.category})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Weight (grams)</label>
                <input
                  type="number"
                  min="1"
                  value={ingredientWeight}
                  onChange={(e) => setIngredientWeight(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded p-1.5 text-xs text-white text-right font-mono focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                disabled={!selectedFoodId}
                className="py-1.5 px-3 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 text-white font-semibold text-xs rounded flex items-center justify-center space-x-1.5 transition-all cursor-pointer h-[32px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ingredient</span>
              </button>
            </div>

            {/* Added Ingredients Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 pb-2">
                    <th className="pb-2">Ingredient name</th>
                    <th className="pb-2 text-right">Raw weight (g)</th>
                    <th className="pb-2 text-right">kcal (raw)</th>
                    <th className="pb-2 text-right">Protein (g)</th>
                    <th className="pb-2 text-right">Carbs (g)</th>
                    <th className="pb-2 text-right">Fat (g)</th>
                    <th className="pb-2 text-center w-[50px]">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {recipeIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-zinc-500 font-mono">
                        No recipe ingredients selected. Search food database above.
                      </td>
                    </tr>
                  ) : (
                    recipeIngredients.map((ing, idx) => {
                      const scale = ing.weightGrams / 100;
                      return (
                        <tr key={idx} className="hover:bg-[#1a1a1a]/40 transition-colors">
                          <td className="py-2.5 font-medium text-zinc-200">{ing.name}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-zinc-100">{ing.weightGrams}g</td>
                          <td className="py-2.5 text-right font-mono">{Math.round(ing.foodItem.calories * scale)}</td>
                          <td className="py-2.5 text-right font-mono text-[#00d4ff]">{(ing.foodItem.protein * scale).toFixed(1)}</td>
                          <td className="py-2.5 text-right font-mono text-purple-400">{(ing.foodItem.carbs * scale).toFixed(1)}</td>
                          <td className="py-2.5 text-right font-mono text-amber-500">{(ing.foodItem.fat * scale).toFixed(1)}</td>
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => handleRemoveIngredient(idx)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recipe Nutrients Output */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block border-b border-zinc-800 pb-2">
              Analyzed Nutritional Content
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/40">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Raw recipe weight</span>
                <span className="text-base font-bold font-mono text-zinc-100">{recipeNutrients.rawWeightGrams}g</span>
              </div>

              <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/40">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Yield factor cooked weight</span>
                <span className="text-base font-bold font-mono text-zinc-100">
                  {Math.round(recipeNutrients.cookedWeightGrams)}g
                </span>
                <span className="text-[8px] text-zinc-600 block mt-0.5">Factor: {yieldFactor}x</span>
              </div>

              <div className="p-3 bg-zinc-900/40 rounded border border-zinc-800/40">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Calories per serving</span>
                <span className="text-base font-bold font-mono text-purple-400">{recipeNutrients.perPortion.calories} kcal</span>
                <span className="text-[8px] text-zinc-600 block mt-0.5">Portions: {portions}</span>
              </div>

              <div className="p-3 bg-[#00d4ff]/10 rounded border border-[#00d4ff]/30">
                <span className="text-[9px] font-mono text-[#00d4ff] block uppercase font-bold">Calories / 100g Cooked</span>
                <span className="text-base font-bold font-mono text-white">{recipeNutrients.per100g.calories} kcal</span>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[9px] font-mono uppercase text-zinc-500 pb-1">
                    <th className="pb-1">Nutrient</th>
                    <th className="pb-1 text-right">Value per 100g Cooked</th>
                    <th className="pb-1 text-right">Value per Serving / Portion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-300">Protein (g)</td>
                    <td className="py-2 text-right font-mono text-[#00d4ff]">{recipeNutrients.per100g.protein}g</td>
                    <td className="py-2 text-right font-mono text-[#00d4ff]">{recipeNutrients.perPortion.protein}g</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-300">Carbohydrates (g)</td>
                    <td className="py-2 text-right font-mono text-purple-400">{recipeNutrients.per100g.carbs}g</td>
                    <td className="py-2 text-right font-mono text-purple-400">{recipeNutrients.perPortion.carbs}g</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-300">Fat (g)</td>
                    <td className="py-2 text-right font-mono text-amber-500">{recipeNutrients.per100g.fat}g</td>
                    <td className="py-2 text-right font-mono text-amber-500">{recipeNutrients.perPortion.fat}g</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-300">Fiber (g)</td>
                    <td className="py-2 text-right font-mono">{recipeNutrients.per100g.fiber}g</td>
                    <td className="py-2 text-right font-mono">{recipeNutrients.perPortion.fiber}g</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-300">Sodium (mg)</td>
                    <td className="py-2 text-right font-mono">{recipeNutrients.per100g.sodium}mg</td>
                    <td className="py-2 text-right font-mono">{recipeNutrients.perPortion.sodium}mg</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-400 italic">Vitamin C (mg) (After Cooking loss)</td>
                    <td className="py-2 text-right font-mono text-rose-400">{recipeNutrients.per100g.vitaminC}mg</td>
                    <td className="py-2 text-right font-mono text-rose-400">{recipeNutrients.perPortion.vitaminC}mg</td>
                  </tr>
                  <tr className="hover:bg-[#1a1a1a]/40">
                    <td className="py-2 text-zinc-400 italic">Vitamin A (mcg) (After Cooking loss)</td>
                    <td className="py-2 text-right font-mono text-orange-400">{recipeNutrients.per100g.vitaminA}mcg</td>
                    <td className="py-2 text-right font-mono text-orange-400">{recipeNutrients.perPortion.vitaminA}mcg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Publish controls */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-[10px] text-zinc-500 font-mono leading-normal mr-4">
                Tip: Publishing compiles the cooked nutrients (per 100g) and logs them as a standard food database entry ready to use in diet worksheets.
              </div>

              <button
                onClick={handlePublishRecipe}
                className="py-2 px-4 bg-gradient-to-r from-[#7c3aed] to-[#00d4ff] hover:opacity-90 text-white font-bold text-xs rounded flex items-center space-x-1.5 shadow-md cursor-pointer transition-opacity shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Recipe as Food Item</span>
              </button>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded text-[10px] font-mono border ${
                statusMessage.startsWith("Error") 
                  ? "bg-rose-950/10 border-rose-900/30 text-rose-400" 
                  : "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
              }`}>
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
