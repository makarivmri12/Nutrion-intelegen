// @ts-ignore
import lpSolver from "javascript-lp-solver";
import { FoodItem } from "../types";

export interface FoodConstraint {
  foodId: string;
  minAmount?: number; // in grams
  maxAmount?: number; // in grams
  pricePer100g?: number; // in IDR
}

export interface OptimizationInput {
  targetGroup: string; // 'children_6_23mo', 'pregnant_women', etc.
  constraints: {
    minEnergy: number;
    minProtein: number;
    minIron: number;
    minCalcium: number;
    maxCost: number;
    maxMeals: number;
  };
  availableFoods: string[]; // food IDs
  foodConstraints?: Record<string, FoodConstraint>;
  preferences: {
    localFoodsOnly: boolean;
    halalOnly: boolean;
    excludeFoods: string[];
  };
}

export interface OptimizationResult {
  optimalDiet: {
    foodId: string;
    name: string;
    amount: number; // grams per day
    cost: number;
  }[];
  totalNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    iron: number;
    calcium: number;
  };
  totalCost: number;
  meetsRequirements: boolean;
  problemNutrients: string[]; // nutrients still in deficit
}

export function getFoodPricePer100g(food: FoodItem): number {
  const category = (food.category || "").toLowerCase();
  const name = (food.name || "").toLowerCase();
  
  if (name.includes("tempe") || name.includes("tahu")) {
    return 1000; // very economical local proteins
  }
  if (category.includes("protein") || category.includes("meat") || category.includes("fish") || category.includes("poultry") || category.includes("egg")) {
    return 4500;
  }
  if (category.includes("grain") || category.includes("cereal") || category.includes("rice") || category.includes("tuber")) {
    return 1200;
  }
  if (category.includes("fruit")) {
    return 3000;
  }
  if (category.includes("vegetable") || category.includes("sayur")) {
    return 1800;
  }
  if (category.includes("dairy") || category.includes("milk") || category.includes("susu")) {
    return 3500;
  }
  return 2000; // default standard price per 100g
}

export function optimizeDiet(input: OptimizationInput, foodDatabase: FoodItem[]): OptimizationResult {
  // 1. Filter foods by preferences & availability
  let filteredFoods = foodDatabase.filter(food => input.availableFoods.includes(food.id));
  
  if (input.preferences.excludeFoods && input.preferences.excludeFoods.length > 0) {
    filteredFoods = filteredFoods.filter(food => !input.preferences.excludeFoods.includes(food.id));
  }

  if (input.preferences.halalOnly) {
    filteredFoods = filteredFoods.filter(food => {
      const n = food.name.toLowerCase();
      return !n.includes("pork") && !n.includes("babi") && !n.includes("ham") && !n.includes("bacon");
    });
  }

  if (input.preferences.localFoodsOnly) {
    filteredFoods = filteredFoods.filter(food => {
      const n = food.name.toLowerCase();
      const cat = food.category.toLowerCase();
      return n.includes("tempe") || n.includes("tahu") || n.includes("sayur") || n.includes("nasi") || n.includes("kangkung") || n.includes("pisang") || n.includes("singkong") || n.includes("pepaya") || n.includes("ayam") || n.includes("lele") || cat.includes("indonesia") || food.databaseSource === "INDONESIAN";
    });
  }

  // Fallback: If filtered list is empty, restore filtered list to let the algorithm find a solution
  if (filteredFoods.length === 0) {
    filteredFoods = foodDatabase.slice(0, 15);
  }

  // 2. Build Linear Programming Model
  // Target: Minimize cost
  const model: any = {
    optimize: "cost",
    opType: "min",
    constraints: {
      energy: { min: input.constraints.minEnergy },
      protein: { min: input.constraints.minProtein },
      iron: { min: input.constraints.minIron },
      calcium: { min: input.constraints.minCalcium },
      totalWeight: { max: 2000 } // Max 2kg total intake per day
    },
    variables: {}
  };

  // Add LP variable definitions for each eligible food
  // Note: lp-solver variables represent portions/weights in units of 100g
  filteredFoods.forEach(food => {
    const custom = input.foodConstraints?.[food.id];
    const price = custom?.pricePer100g ?? getFoodPricePer100g(food);
    const minGrams = custom?.minAmount ?? 0;
    const maxGrams = custom?.maxAmount ?? 400; // default max 400g

    model.variables[food.id] = {
      energy: food.calories || 0,
      protein: food.protein || 0,
      iron: food.iron || 0,
      calcium: food.calcium || 0,
      totalWeight: 1, // weight multiplier in units of 100g
      cost: price
    };
    
    // Add custom bounds per food item to prevent over-representing a single ingredient
    model.constraints[food.id] = { 
      min: minGrams / 100, 
      max: maxGrams / 100 
    }; 
    model.variables[food.id][food.id] = 1;
  });

  let optimalDiet: { foodId: string; name: string; amount: number; cost: number }[] = [];
  let totalCost = 0;
  let meetsRequirements = false;
  let problemNutrients: string[] = [];

  try {
    // Solve with javascript-lp-solver
    const solution: any = lpSolver.Solve ? lpSolver.Solve(model) : { feasible: false };
    
    if (solution.feasible && solution.result) {
      meetsRequirements = true;
      totalCost = solution.result;

      filteredFoods.forEach(food => {
        const value100gUnits = solution[food.id];
        if (value100gUnits && value100gUnits > 0.05) {
          const grams = Math.round(value100gUnits * 100);
          const custom = input.foodConstraints?.[food.id];
          const price = custom?.pricePer100g ?? getFoodPricePer100g(food);
          optimalDiet.push({
            foodId: food.id,
            name: food.name,
            amount: grams,
            cost: Math.round((grams / 100) * price)
          });
        }
      });
    } else {
      // Execute smart greedy simplex heuristic if exact solution is infeasible
      throw new Error("LP Infeasible");
    }
  } catch (err) {
    // ==========================================
    // CLINICAL GREEDY FALLBACK ALGORITHM
    // ==========================================
    meetsRequirements = false;
    optimalDiet = [];
    
    // Sort foods by overall nutrient density relative to cost
    const sortedByValue = [...filteredFoods].sort((a, b) => {
      const priceA = getFoodPricePer100g(a);
      const priceB = getFoodPricePer100g(b);
      const scoreA = (a.calories + a.protein * 4 + a.iron * 2 + a.calcium) / priceA;
      const scoreB = (b.calories + b.protein * 4 + b.iron * 2 + b.calcium) / priceB;
      return scoreB - scoreA;
    });

    let accumulatedEnergy = 0;
    let accumulatedProtein = 0;
    let accumulatedIron = 0;
    let accumulatedCalcium = 0;

    // Greedy-select until bounds or maximum limits are reached
    for (const food of sortedByValue) {
      if (
        accumulatedEnergy >= input.constraints.minEnergy &&
        accumulatedProtein >= input.constraints.minProtein &&
        accumulatedIron >= input.constraints.minIron &&
        accumulatedCalcium >= input.constraints.minCalcium
      ) {
        break; // Met all criteria
      }

      // Add standard therapeutic serving size (e.g. 150g)
      const servingGrams = 150;
      const price = getFoodPricePer100g(food);
      const scale = servingGrams / 100;

      accumulatedEnergy += food.calories * scale;
      accumulatedProtein += food.protein * scale;
      accumulatedIron += food.iron * scale;
      accumulatedCalcium += food.calcium * scale;

      optimalDiet.push({
        foodId: food.id,
        name: food.name,
        amount: servingGrams,
        cost: Math.round(scale * price)
      });
    }

    totalCost = optimalDiet.reduce((sum, item) => sum + item.cost, 0);
    meetsRequirements = 
      accumulatedEnergy >= input.constraints.minEnergy &&
      accumulatedProtein >= input.constraints.minProtein;
  }

  // 3. Calculate nutrient totals for optimal layout
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalIron = 0;
  let totalCalcium = 0;

  optimalDiet.forEach(item => {
    const original = foodDatabase.find(f => f.id === item.foodId);
    if (original) {
      const scale = item.amount / 100;
      totalCalories += original.calories * scale;
      totalProtein += original.protein * scale;
      totalCarbs += original.carbs * scale;
      totalFat += original.fat * scale;
      totalIron += original.iron * scale;
      totalCalcium += original.calcium * scale;
    }
  });

  // Verify missing nutrient bounds
  if (totalCalories < input.constraints.minEnergy) problemNutrients.push("Energy");
  if (totalProtein < input.constraints.minProtein) problemNutrients.push("Protein");
  if (totalIron < input.constraints.minIron) problemNutrients.push("Iron");
  if (totalCalcium < input.constraints.minCalcium) problemNutrients.push("Calcium");

  return {
    optimalDiet,
    totalNutrients: {
      calories: Math.round(totalCalories),
      protein: parseFloat(totalProtein.toFixed(1)),
      carbs: parseFloat(totalCarbs.toFixed(1)),
      fat: parseFloat(totalFat.toFixed(1)),
      iron: parseFloat(totalIron.toFixed(1)),
      calcium: Math.round(totalCalcium)
    },
    totalCost,
    meetsRequirements: problemNutrients.length === 0,
    problemNutrients
  };
}
