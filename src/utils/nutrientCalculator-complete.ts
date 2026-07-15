import { FoodItem, FoodLogEntry } from "../types";
import { cookingFactors } from "../data/cooking-factors";

export interface HighFidelityCalculationResult {
  macronutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
    sugar: number;
  };
  lipids: {
    saturated: number;
    monounsaturated: number;
    polyunsaturated: number;
    cholesterol: number;
  };
  minerals: {
    sodium: number;
    calcium: number;
    iron: number;
    potassium: number;
    magnesium: number;
    zinc: number;
  };
  bioavailability: {
    phyticAcidMg: number;
    estimatedCalciumAbsorbedMg: number;
    estimatedZincAbsorbedMg: number;
    estimatedIronAbsorbedMg: number;
  };
  vitamins: {
    vitaminA: number;
    vitaminC: number;
    vitaminB1: number;
    vitaminB2: number;
    niacin: number;
    vitaminB6: number;
    pantothenicAcid: number;
    vitaminB12: number;
    folate: number;
    retinol: number;
  };
  aminoAcids: {
    tryptophan: number;
    leucine: number;
    lysine: number;
    methionine: number;
    phenylalanine: number;
    valine: number;
  };
}

// High-fidelity calculation for single or list of log entries
export function calculateHighFidelityNutrients(entries: FoodLogEntry[], foodDatabase: FoodItem[]): HighFidelityCalculationResult {
  const result: HighFidelityCalculationResult = {
    macronutrients: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0, sugar: 0 },
    lipids: { saturated: 0, monounsaturated: 0, polyunsaturated: 0, cholesterol: 0 },
    minerals: { sodium: 0, calcium: 0, iron: 0, potassium: 0, magnesium: 0, zinc: 0 },
    bioavailability: { phyticAcidMg: 0, estimatedCalciumAbsorbedMg: 0, estimatedZincAbsorbedMg: 0, estimatedIronAbsorbedMg: 0 },
    vitamins: { vitaminA: 0, vitaminC: 0, vitaminB1: 0, vitaminB2: 0, niacin: 0, vitaminB6: 0, pantothenicAcid: 0, vitaminB12: 0, folate: 0, retinol: 0 },
    aminoAcids: { tryptophan: 0, leucine: 0, lysine: 0, methionine: 0, phenylalanine: 0, valine: 0 }
  };

  entries.forEach((entry) => {
    const food = foodDatabase.find((f) => f.id === entry.foodId) || {
      calories: entry.calories || 0,
      protein: entry.protein || 0,
      carbs: entry.carbs || 0,
      fat: entry.fat || 0,
      fiber: entry.fiber || 0,
      sodium: entry.sodium || 0,
      calcium: entry.calcium || 0,
      iron: entry.iron || 0,
      vitaminC: entry.vitaminC || 0,
      potassium: entry.potassium || 0,
      magnesium: entry.magnesium || 0,
      zinc: entry.zinc || 0,
      folate: entry.folate || 0,
      vitaminA: entry.vitaminA || 0,
      water: entry.water || 0,
      sugar: entry.sugar || 0,
      fatSaturated: entry.fatSaturated,
      fatMonounsaturated: entry.fatMonounsaturated,
      fatPolyunsaturated: entry.fatPolyunsaturated,
      cholesterol: entry.cholesterol,
      tryptophan: entry.tryptophan,
      leucine: entry.leucine,
      lysine: entry.lysine,
      methionine: entry.methionine,
      phenylalanine: entry.phenylalanine,
      valine: entry.valine,
      phytic_acid: 0,
      calcium_absorb_factor: 0.3,
      zinc_absorb_factor: 0.4,
      iron_absorb_factor: 0.15
    } as FoodItem;

    const multiplier = entry.weightGrams / 100;

    // Macronutrients
    result.macronutrients.calories += Math.round((food.calories ?? 0) * multiplier);
    result.macronutrients.protein += Number(((food.protein ?? 0) * multiplier).toFixed(2));
    result.macronutrients.carbs += Number(((food.carbs ?? 0) * multiplier).toFixed(2));
    result.macronutrients.fat += Number(((food.fat ?? 0) * multiplier).toFixed(2));
    result.macronutrients.fiber += Number(((food.fiber ?? 0) * multiplier).toFixed(2));
    result.macronutrients.water += Number(((food.water ?? 75) * multiplier).toFixed(2));
    result.macronutrients.sugar += Number(((food.sugar ?? 0) * multiplier).toFixed(2));

    // Lipids
    result.lipids.saturated += Number(((food.fatSaturated ?? 0) * multiplier).toFixed(2));
    result.lipids.monounsaturated += Number(((food.fatMonounsaturated ?? 0) * multiplier).toFixed(2));
    result.lipids.polyunsaturated += Number(((food.fatPolyunsaturated ?? 0) * multiplier).toFixed(2));
    result.lipids.cholesterol += Math.round((food.cholesterol ?? 0) * multiplier);

    // Minerals
    result.minerals.sodium += Math.round((food.sodium ?? 0) * multiplier);
    result.minerals.calcium += Math.round((food.calcium ?? 0) * multiplier);
    result.minerals.iron += Number(((food.iron ?? 0) * multiplier).toFixed(2));
    result.minerals.potassium += Math.round((food.potassium ?? 0) * multiplier);
    result.minerals.magnesium += Math.round((food.magnesium ?? 0) * multiplier);
    result.minerals.zinc += Number(((food.zinc ?? 0) * multiplier).toFixed(2));

    // Phytic acid & Bioavailability
    const phyticAcid = (food.phytic_acid ?? 0) * multiplier;
    result.bioavailability.phyticAcidMg += Number(phyticAcid.toFixed(2));

    // Phytate-adjusted mineral bioavailability
    // High phytic acid reduces absorption factor significantly
    const caFactor = phyticAcid > 200 ? (food.calcium_absorb_factor ?? 0.3) * 0.5 : (food.calcium_absorb_factor ?? 0.3);
    const znFactor = phyticAcid > 200 ? (food.zinc_absorb_factor ?? 0.4) * 0.4 : (food.zinc_absorb_factor ?? 0.4);
    const feFactor = phyticAcid > 200 ? (food.iron_absorb_factor ?? 0.15) * 0.3 : (food.iron_absorb_factor ?? 0.15);

    result.bioavailability.estimatedCalciumAbsorbedMg += Number(((food.calcium ?? 0) * multiplier * caFactor).toFixed(2));
    result.bioavailability.estimatedZincAbsorbedMg += Number(((food.zinc ?? 0) * multiplier * znFactor).toFixed(2));
    result.bioavailability.estimatedIronAbsorbedMg += Number(((food.iron ?? 0) * multiplier * feFactor).toFixed(2));

    // Vitamins
    result.vitamins.vitaminA += Math.round((food.vitaminA ?? 0) * multiplier);
    result.vitamins.vitaminC += Number(((food.vitaminC ?? 0) * multiplier).toFixed(2));
    result.vitamins.vitaminB1 += Number(((food.vitaminB1 ?? 0) * multiplier).toFixed(2));
    result.vitamins.vitaminB2 += Number(((food.vitaminB2 ?? 0) * multiplier).toFixed(2));
    result.vitamins.niacin += Number(((food.niacin ?? 0) * multiplier).toFixed(2));
    result.vitamins.vitaminB6 += Number(((food.vitaminB6 ?? 0) * multiplier).toFixed(2));
    result.vitamins.pantothenicAcid += Number(((food.pantothenicAcid ?? 0) * multiplier).toFixed(2));
    result.vitamins.vitaminB12 += Number(((food.vitaminB12 ?? 0) * multiplier).toFixed(2));
    result.vitamins.folate += Math.round((food.folate ?? 0) * multiplier);
    result.vitamins.retinol += Math.round((food.retinol ?? 0) * multiplier);

    // Amino Acids (per 100g)
    result.aminoAcids.tryptophan += Math.round((food.tryptophan ?? 0) * multiplier);
    result.aminoAcids.leucine += Math.round((food.leucine ?? 0) * multiplier);
    result.aminoAcids.lysine += Math.round((food.lysine ?? 0) * multiplier);
    result.aminoAcids.methionine += Math.round((food.methionine ?? 0) * multiplier);
    result.aminoAcids.phenylalanine += Math.round((food.phenylalanine ?? 0) * multiplier);
    result.aminoAcids.valine += Math.round((food.valine ?? 0) * multiplier);
  });

  return result;
}

/**
 * Calculates raw weight and retains nutrients based on USDA and TKPI retention tables.
 * Inputs: raw food item, cooking method, and cooked (consumed) weight.
 * Process:
 * 1. Find cooking factor (yield and retention).
 * 2. Calculate raw weight = cooked weight / yieldFactor.
 * 3. Multiply raw nutrition by retentionFactor.
 */
export function calculateCookedNutrients(
  foodItem: FoodItem,
  cookingMethod: string = "Mentah",
  cookedWeightGrams: number
): Partial<FoodLogEntry> {
  // Normalize cooking method
  const method = cookingMethod || "Mentah";

  // Find matching cooking factor based on category
  let factor = cookingFactors.find(
    (cf) => cf.foodCategory.toLowerCase() === foodItem.category.toLowerCase() &&
            cf.cookingMethod === method
  );

  // Fallback to substring matching on category
  if (!factor) {
    factor = cookingFactors.find(
      (cf) => (foodItem.category.toLowerCase().includes(cf.foodCategory.toLowerCase()) || 
               cf.foodCategory.toLowerCase().includes(foodItem.category.toLowerCase())) &&
              cf.cookingMethod === method
    );
  }

  // General fallbacks based on food category types
  if (!factor) {
    const isVegetable = foodItem.category.toLowerCase().includes("veg") || foodItem.category.toLowerCase().includes("sayur");
    const isGrain = foodItem.category.toLowerCase().includes("grain") || foodItem.category.toLowerCase().includes("beras") || foodItem.category.toLowerCase().includes("nasi");
    
    let defaultCategory = "Proteins";
    if (isVegetable) defaultCategory = "Vegetables";
    else if (isGrain) defaultCategory = "Grains & Cereals";

    factor = cookingFactors.find(
      (cf) => cf.foodCategory === defaultCategory && cf.cookingMethod === method
    ) || cookingFactors.find((cf) => cf.cookingMethod === "Mentah")!;
  }

  const yieldFactor = factor?.yieldFactor ?? 1.0;
  const rawWeightGrams = parseFloat((cookedWeightGrams / yieldFactor).toFixed(1));

  // Base raw weight scale (since DB values are per 100g raw)
  const rawScale = rawWeightGrams / 100;
  const rf = factor?.retentionFactors ?? {
    protein: 1.0, fat: 1.0, carbs: 1.0, fiber: 1.0,
    vitaminA: 1.0, vitaminC: 1.0, iron: 1.0, calcium: 1.0,
    zinc: 1.0, potassium: 1.0, magnesium: 1.0, folate: 1.0
  };

  // Adjust macronutrients with retention applied
  const protein = parseFloat(((foodItem.protein ?? 0) * rawScale * rf.protein).toFixed(1));
  const fat = parseFloat(((foodItem.fat ?? 0) * rawScale * rf.fat).toFixed(1));
  const carbs = parseFloat(((foodItem.carbs ?? 0) * rawScale * rf.carbs).toFixed(1));

  // Recalculate calories from cooked macronutrients
  const calories = Math.round(protein * 4 + carbs * 4 + fat * 9) || Math.round((foodItem.calories ?? 0) * rawScale);

  return {
    weightGrams: cookedWeightGrams,
    cookingMethod: method,
    rawWeightGrams,
    calories,
    protein,
    carbs,
    fat,
    fiber: parseFloat(((foodItem.fiber ?? 0) * rawScale * rf.fiber).toFixed(1)),
    sodium: Math.round((foodItem.sodium ?? 0) * rawScale),
    calcium: Math.round((foodItem.calcium ?? 0) * rawScale * rf.calcium),
    iron: parseFloat(((foodItem.iron ?? 0) * rawScale * rf.iron).toFixed(1)),
    vitaminC: parseFloat(((foodItem.vitaminC ?? 0) * rawScale * rf.vitaminC).toFixed(1)),
    potassium: Math.round((foodItem.potassium ?? 0) * rawScale * rf.potassium),
    magnesium: Math.round((foodItem.magnesium ?? 0) * rawScale * rf.magnesium),
    zinc: parseFloat(((foodItem.zinc ?? 0) * rawScale * rf.zinc).toFixed(1)),
    folate: Math.round((foodItem.folate ?? 0) * rawScale * rf.folate),
    vitaminA: Math.round((foodItem.vitaminA ?? 0) * rawScale * rf.vitaminA),
    water: parseFloat(((foodItem.water ?? 75) * rawScale * (1 / yieldFactor)).toFixed(1)),
    sugar: parseFloat(((foodItem.sugar ?? 0) * rawScale).toFixed(1)),
    
    // Copy remaining fields from foodItem
    price_per_100g: foodItem.price_per_100g,
    phytic_acid: foodItem.phytic_acid,
    calcium_absorb_factor: foodItem.calcium_absorb_factor,
    zinc_absorb_factor: foodItem.zinc_absorb_factor,
    iron_absorb_factor: foodItem.iron_absorb_factor,
    vitaminB1: foodItem.vitaminB1 !== undefined ? parseFloat((foodItem.vitaminB1 * rawScale).toFixed(2)) : undefined,
    vitaminB2: foodItem.vitaminB2 !== undefined ? parseFloat((foodItem.vitaminB2 * rawScale).toFixed(2)) : undefined,
    niacin: foodItem.niacin !== undefined ? parseFloat((foodItem.niacin * rawScale).toFixed(2)) : undefined,
    vitaminB6: foodItem.vitaminB6 !== undefined ? parseFloat((foodItem.vitaminB6 * rawScale).toFixed(2)) : undefined,
    pantothenicAcid: foodItem.pantothenicAcid !== undefined ? parseFloat((foodItem.pantothenicAcid * rawScale).toFixed(2)) : undefined,
    vitaminB12: foodItem.vitaminB12 !== undefined ? parseFloat((foodItem.vitaminB12 * rawScale).toFixed(2)) : undefined,
    retinol: foodItem.retinol !== undefined ? Math.round(foodItem.retinol * rawScale) : undefined,
  };
}

