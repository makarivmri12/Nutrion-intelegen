import { create } from "zustand";
import { PatientProfile, FoodItem, FoodLogEntry, NutrientTargets, Project, AppTab } from "../types";
import { DEFAULT_FOODS } from "../data/foodDatabase";
import { calculateCookedNutrients } from "../utils/nutrientCalculator-complete";

interface NutriState {
  projects: Project[];
  currentProjectId: string | null;
  foodDatabase: FoodItem[];
  currentTab: AppTab;
  isSaving: boolean;
  selectedDatabaseSource: string;
  
  // Actions
  setTab: (tab: AppTab) => void;
  loadFromLocalStorage: () => void;
  createNewProject: (name: string, patientName?: string) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  updatePatientProfile: (profile: Partial<PatientProfile>) => void;
  addFoodLogEntry: (foodItem: FoodItem, weightGrams: number, portionName?: string, cookingMethod?: string) => void;
  updateFoodLogEntryWeight: (entryId: string, weightGrams: number, portionName?: string) => void;
  updateFoodLogEntryCookingMethod: (entryId: string, cookingMethod: string) => void;
  removeFoodLogEntry: (entryId: string) => void;
  clearFoodLogs: () => void;
  setFoodLogs: (logs: FoodLogEntry[]) => void;
  addCustomFoodItem: (food: Omit<FoodItem, "id">) => void;
  addMultipleCustomFoodItems: (foods: Omit<FoodItem, "id">[]) => void;
  updateCustomFoodItem: (id: string, food: Partial<FoodItem>) => void;
  deleteCustomFoodItem: (id: string) => void;
  importSampleProject: () => void;
  setSelectedDatabaseSource: (source: string) => void;
}

// Helper calculations
export function calculateBMI(weight: number, height: number): { bmi: number; category: string } {
  if (!weight || !height) return { bmi: 0, category: "N/A" };
  const heightMeters = height / 100;
  const bmi = weight / (heightMeters * heightMeters);
  let category = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal Weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";
  return { bmi: parseFloat(bmi.toFixed(1)), category };
}

export function calculateBMR(weight: number, height: number, age: number, gender: "Male" | "Female"): number {
  if (!weight || !height || !age) return 0;
  // Harris-Benedict Formula
  if (gender === "Male") {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
}

export function calculateNutrientTargets(profile: PatientProfile): NutrientTargets {
  let calories = 2000;
  let protein = 60;
  let carbs = 300;
  let fat = 65;
  let fiber = profile.gender === "Male" ? 38 : 25;
  let sodium = 2000;
  let calcium = 1000;
  let iron = profile.gender === "Female" && profile.age < 50 ? 18 : 8;
  let vitaminC = profile.gender === "Male" ? 90 : 75;
  let potassium = 4700;
  let magnesium = profile.gender === "Male" ? 350 : 310;
  let zinc = profile.gender === "Male" ? 11 : 8;
  let folate = 400;
  let vitaminA = profile.gender === "Male" ? 900 : 700;
  let water = profile.gender === "Male" ? 2700 : 2300;
  let sugar = 50;

  // 1. Check if Pediatric (age < 18, and particularly age <= 5)
  const isPediatric = profile.age !== undefined && profile.age < 18;
  const isToddlerOrInfant = profile.ageMonths !== undefined ? profile.ageMonths <= 60 : (profile.age <= 5);
  const ageMonths = profile.ageMonths || (profile.age * 12);

  if (isPediatric && isToddlerOrInfant) {
    // AKG 2019 standards for child development
    if (ageMonths <= 6) {
      calories = 550; protein = 9; fat = 31; carbs = 59; water = 700; fiber = 0;
      calcium = 200; iron = 0.3; zinc = 1.1; vitaminA = 375; vitaminC = 40; folate = 80; sodium = 120; potassium = 500; magnesium = 30;
    } else if (ageMonths <= 11) {
      calories = 800; protein = 15; fat = 35; carbs = 105; water = 900; fiber = 11;
      calcium = 270; iron = 11; zinc = 3; vitaminA = 400; vitaminC = 50; folate = 80; sodium = 370; potassium = 700; magnesium = 55;
    } else if (ageMonths <= 36) { // 1-3 years
      calories = 1350; protein = 20; fat = 45; carbs = 215; water = 1150; fiber = 19;
      calcium = 650; iron = 7; zinc = 3; vitaminA = 400; vitaminC = 40; folate = 150; sodium = 900; potassium = 2600; magnesium = 65;
    } else { // 4-5 years (48-60m)
      calories = 1400; protein = 25; fat = 50; carbs = 220; water = 1450; fiber = 22;
      calcium = 1000; iron = 9; zinc = 4; vitaminA = 450; vitaminC = 45; folate = 200; sodium = 900; potassium = 3000; magnesium = 95;
    }
  } else if (isPediatric) {
    // Standard older kids/teens estimate
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    let factor = 1.3;
    if (profile.activityLevel === "Lightly Active") factor = 1.45;
    else if (profile.activityLevel === "Moderately Active") factor = 1.65;
    else if (profile.activityLevel === "Very Active") factor = 1.85;
    const tdee = Math.round(bmr * factor) || 1800;

    calories = tdee;
    protein = Math.round((tdee * 0.15) / 4);
    carbs = Math.round((tdee * 0.55) / 4);
    fat = Math.round((tdee * 0.30) / 9);
    fiber = profile.gender === "Male" ? 30 : 25;
    calcium = 1200; // high for adolescents
    iron = profile.gender === "Female" ? 15 : 11;
    vitaminC = profile.gender === "Male" ? 75 : 65;
  } else {
    // Adult calculation
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    let factor = 1.2;
    if (profile.activityLevel === "Lightly Active") factor = 1.375;
    else if (profile.activityLevel === "Moderately Active") factor = 1.55;
    else if (profile.activityLevel === "Very Active") factor = 1.725;
    const tdee = Math.round(bmr * factor) || 2000;

    calories = tdee;
    protein = Math.round((tdee * 0.18) / 4);
    carbs = Math.round((tdee * 0.52) / 4);
    fat = Math.round((tdee * 0.30) / 9);
  }

  // 2. Female specific adjustments (Pregnancy & Lactation) - AKG 2019
  if (profile.gender === "Female") {
    // Pregnancy adjustments
    if (profile.pregnancyStatus && profile.pregnancyStatus !== 'none') {
      if (profile.pregnancyStatus === 'trimester1') {
        calories += 180;
        protein += 1.5;
        folate += 200;
        calcium += 200;
        water += 300;
      } else { // Trimester 2 and 3
        const isTri3 = profile.pregnancyStatus === 'trimester3';
        calories += 300;
        protein += isTri3 ? 30 : 9;
        iron += 9;
        folate += 200;
        calcium += 200;
        water += 300;
        zinc += 2;
      }
    }
    
    // Lactation adjustments
    if (profile.lactationStatus && profile.lactationStatus !== 'none') {
      if (profile.lactationStatus === 'months0to6') {
        calories += 330;
        protein += 20;
        water += 800; // highly increased for milk production
        vitaminC += 45;
        folate += 100;
      } else if (profile.lactationStatus === 'months7to12') {
        calories += 400;
        protein += 15;
        water += 650;
        vitaminC += 40;
        folate += 100;
      }
    }
  }

  return {
    calories,
    protein: parseFloat(protein.toFixed(1)),
    carbs: parseFloat(carbs.toFixed(1)),
    fat: parseFloat(fat.toFixed(1)),
    fiber,
    sodium,
    calcium,
    iron,
    vitaminC,
    potassium,
    magnesium,
    zinc,
    folate,
    vitaminA,
    water,
    sugar,
  };
}

const DEFAULT_PROFILE: PatientProfile = {
  id: "p-default",
  name: "Budi Santoso",
  age: 42,
  gender: "Male",
  height: 172,
  weight: 78,
  activityLevel: "Moderately Active",
  conditions: "Hipertensi ringan, Kelelahan kronis",
  notes: "Pasien mengeluhkan mudah lelah di siang hari dan tekanan darah sedikit naik. Kurang asupan serat harian.",
  bmi: 26.4,
  bmiCategory: "Overweight",
  bmr: 1675,
};

export const useNutriStore = create<NutriState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  foodDatabase: DEFAULT_FOODS,
  currentTab: AppTab.SPREADSHEET,
  isSaving: false,
  selectedDatabaseSource: "ALL",

  setTab: (tab) => set({ currentTab: tab }),

  loadFromLocalStorage: () => {
    try {
      const storedProjects = localStorage.getItem("nutri_platform_projects");
      const storedFoods = localStorage.getItem("nutri_platform_foods");
      
      let projects: Project[] = [];
      let foodDatabase = DEFAULT_FOODS;

      if (storedProjects) {
        projects = JSON.parse(storedProjects);
      }
      
      if (storedFoods) {
        foodDatabase = JSON.parse(storedFoods);
      }

      if (projects.length === 0) {
        // Create initial default project
        const { bmi, category } = calculateBMI(DEFAULT_PROFILE.weight, DEFAULT_PROFILE.height);
        const bmr = calculateBMR(DEFAULT_PROFILE.weight, DEFAULT_PROFILE.height, DEFAULT_PROFILE.age, DEFAULT_PROFILE.gender);
        
        const initialProject: Project = {
          id: "proj-1",
          name: "Budi Santoso - Diet Hipertensi",
          patientProfile: {
            ...DEFAULT_PROFILE,
            bmi,
            bmiCategory: category,
            bmr,
          },
          foodLogs: [
            // Standard indomie log as sample entry
            {
              id: "log-1",
              foodId: "m1",
              name: "Indomie Mi Instan",
              category: "Processed Foods",
              weightGrams: 85,
              calories: Math.round((450 * 85) / 100),
              protein: parseFloat(((9.0 * 85) / 100).toFixed(1)),
              carbs: parseFloat(((64.0 * 85) / 100).toFixed(1)),
              fat: parseFloat(((17.0 * 85) / 100).toFixed(1)),
              fiber: parseFloat(((2.0 * 85) / 100).toFixed(1)),
              sodium: Math.round((1240 * 85) / 100),
              calcium: Math.round((25 * 85) / 100),
              iron: parseFloat(((1.8 * 85) / 100).toFixed(1)),
              vitaminC: 0,
              potassium: Math.round((120 * 85) / 100),
              magnesium: Math.round((18 * 85) / 100),
              zinc: parseFloat(((0.5 * 85) / 100).toFixed(1)),
              folate: Math.round((10 * 85) / 100),
              vitaminA: 0,
              water: Math.round((8 * 85) / 100),
              sugar: parseFloat(((5 * 85) / 100).toFixed(1)),
            },
            // Egg boiled
            {
              id: "log-2",
              foodId: "p4",
              name: "Whole Chicken Egg (Boiled)",
              category: "Proteins",
              weightGrams: 100,
              calories: 155,
              protein: 13.0,
              carbs: 1.1,
              fat: 11.0,
              fiber: 0.0,
              sodium: 124,
              calcium: 50,
              iron: 1.2,
              vitaminC: 0,
              potassium: 126,
              magnesium: 10,
              zinc: 1.1,
              folate: 44,
              vitaminA: 149,
              water: 75.0,
              sugar: 1.1,
            },
            // Orange raw
            {
              id: "log-3",
              foodId: "f5",
              name: "Orange (Raw)",
              category: "Fruits",
              weightGrams: 150,
              calories: Math.round((47 * 150) / 100),
              protein: parseFloat(((0.9 * 150) / 100).toFixed(1)),
              carbs: parseFloat(((11.8 * 150) / 100).toFixed(1)),
              fat: parseFloat(((0.1 * 150) / 100).toFixed(1)),
              fiber: parseFloat(((2.4 * 150) / 100).toFixed(1)),
              sodium: 0,
              calcium: Math.round((40 * 150) / 100),
              iron: parseFloat(((0.1 * 150) / 100).toFixed(1)),
              vitaminC: parseFloat(((53.2 * 150) / 100).toFixed(1)),
              potassium: Math.round((181 * 150) / 100),
              magnesium: Math.round((10 * 150) / 100),
              zinc: parseFloat(((0.1 * 150) / 100).toFixed(1)),
              folate: Math.round((30 * 150) / 100),
              vitaminA: Math.round((11 * 150) / 100),
              water: parseFloat(((86.8 * 150) / 100).toFixed(1)),
              sugar: parseFloat(((9.4 * 150) / 100).toFixed(1)),
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        projects = [initialProject];
        localStorage.setItem("nutri_platform_projects", JSON.stringify(projects));
      }

      set({
        projects,
        currentProjectId: projects[0].id,
        foodDatabase,
      });
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  },

  createNewProject: (name, patientName) => {
    set({ isSaving: true });
    const newId = `proj-${Date.now()}`;
    const pName = patientName || "Pasien Baru";
    
    const newProfile: PatientProfile = {
      id: `p-${Date.now()}`,
      name: pName,
      age: 30,
      gender: "Male",
      height: 170,
      weight: 70,
      activityLevel: "Sedentary",
      conditions: "Kondisi umum sehat",
      notes: "",
      bmi: 24.2,
      bmiCategory: "Normal Weight",
      bmr: 1540,
    };

    const newProj: Project = {
      id: newId,
      name,
      patientProfile: newProfile,
      foodLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = [newProj, ...get().projects];
    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    
    set({
      projects: updatedProjects,
      currentProjectId: newId,
      isSaving: false,
    });
  },

  deleteProject: (id) => {
    const updatedProjects = get().projects.filter((p) => p.id !== id);
    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));

    let nextProjectId = get().currentProjectId;
    if (nextProjectId === id) {
      nextProjectId = updatedProjects.length > 0 ? updatedProjects[0].id : null;
    }

    set({
      projects: updatedProjects,
      currentProjectId: nextProjectId,
    });
  },

  selectProject: (id) => {
    set({ currentProjectId: id });
  },

  updatePatientProfile: (updatedFields) => {
    const { projects, currentProjectId } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        const fullProfile = { ...p.patientProfile, ...updatedFields };
        
        // Remove ageMonths if age is > 5 to prevent metadata leakage
        if (fullProfile.age > 5) {
          delete fullProfile.ageMonths;
        }

        // Recalculate BMI & BMR
        const { bmi, category } = calculateBMI(fullProfile.weight, fullProfile.height);
        const bmr = calculateBMR(fullProfile.weight, fullProfile.height, fullProfile.age, fullProfile.gender);

        return {
          ...p,
          patientProfile: {
            ...fullProfile,
            bmi,
            bmiCategory: category,
            bmr,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  addFoodLogEntry: (foodItem, weightGrams, portionName, cookingMethod = "Mentah") => {
    const { projects, currentProjectId } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    
    // Compute exact values based on cooked weight and cooking method
    const cookedFields = calculateCookedNutrients(foodItem, cookingMethod, weightGrams);
    const newEntry: FoodLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      foodId: foodItem.id,
      name: foodItem.name,
      category: foodItem.category,
      portionName,
      ...cookedFields
    } as FoodLogEntry;

    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          foodLogs: [...p.foodLogs, newEntry],
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  updateFoodLogEntryWeight: (entryId, weightGrams, portionName) => {
    const { projects, currentProjectId, foodDatabase } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        const updatedLogs = p.foodLogs.map((log) => {
          if (log.id === entryId) {
            // Find original food attributes to scale accurately
            const originalFood = foodDatabase.find((f) => f.id === log.foodId);
            if (!originalFood) return { ...log, weightGrams, portionName }; // Fallback

            const cookedFields = calculateCookedNutrients(originalFood, log.cookingMethod || "Mentah", weightGrams);
            return {
              ...log,
              weightGrams,
              portionName: portionName !== undefined ? portionName : log.portionName,
              ...cookedFields
            };
          }
          return log;
        });

        return {
          ...p,
          foodLogs: updatedLogs,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  updateFoodLogEntryCookingMethod: (entryId, cookingMethod) => {
    const { projects, currentProjectId, foodDatabase } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        const updatedLogs = p.foodLogs.map((log) => {
          if (log.id === entryId) {
            // Find original food attributes to scale accurately
            const originalFood = foodDatabase.find((f) => f.id === log.foodId);
            if (!originalFood) return { ...log, cookingMethod }; // Fallback

            const cookedFields = calculateCookedNutrients(originalFood, cookingMethod, log.weightGrams);
            return {
              ...log,
              ...cookedFields
            };
          }
          return log;
        });

        return {
          ...p,
          foodLogs: updatedLogs,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  removeFoodLogEntry: (entryId) => {
    const { projects, currentProjectId } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          foodLogs: p.foodLogs.filter((log) => log.id !== entryId),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  clearFoodLogs: () => {
    const { projects, currentProjectId } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          foodLogs: [],
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  setFoodLogs: (logs) => {
    const { projects, currentProjectId } = get();
    if (!currentProjectId) return;

    set({ isSaving: true });
    const updatedProjects = projects.map((p) => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          foodLogs: logs,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({ projects: updatedProjects, isSaving: false });
  },

  addCustomFoodItem: (food) => {
    const newFood: FoodItem = {
      ...food,
      id: `food-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    const updatedDatabase = [newFood, ...get().foodDatabase];
    localStorage.setItem("nutri_platform_foods", JSON.stringify(updatedDatabase));
    set({ foodDatabase: updatedDatabase });
  },

  addMultipleCustomFoodItems: (foods) => {
    const newFoods: FoodItem[] = foods.map((f, idx) => ({
      ...f,
      id: `food-custom-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`
    }));

    const updatedDatabase = [...newFoods, ...get().foodDatabase];
    localStorage.setItem("nutri_platform_foods", JSON.stringify(updatedDatabase));
    set({ foodDatabase: updatedDatabase });
  },

  updateCustomFoodItem: (id, updatedFood) => {
    const updatedDatabase = get().foodDatabase.map((f) =>
      f.id === id ? { ...f, ...updatedFood } : f
    );
    localStorage.setItem("nutri_platform_foods", JSON.stringify(updatedDatabase));
    set({ foodDatabase: updatedDatabase });
  },

  deleteCustomFoodItem: (id) => {
    const updatedDatabase = get().foodDatabase.filter((f) => f.id !== id);
    localStorage.setItem("nutri_platform_foods", JSON.stringify(updatedDatabase));
    set({ foodDatabase: updatedDatabase });
  },

  setSelectedDatabaseSource: (source) => {
    set({ selectedDatabaseSource: source });
  },

  importSampleProject: () => {
    set({ isSaving: true });
    const sampleId = `proj-sample-cardio`;
    const sampleProfile: PatientProfile = {
      id: "p-sample-2",
      name: "Siti Rahma",
      age: 56,
      gender: "Female",
      height: 158,
      weight: 64,
      activityLevel: "Lightly Active",
      conditions: "Diabetes Melitus Tipe 2, Kolesterol Tinggi",
      notes: "Pasien memerlukan pemantauan ketat asupan gula sederhana dan asam lemak jenuh harian.",
      bmi: 25.6,
      bmiCategory: "Overweight",
      bmr: 1245,
    };

    const sampleProj: Project = {
      id: sampleId,
      name: "Siti Rahma - Pemulihan Diabetes Tipe 2",
      patientProfile: sampleProfile,
      foodLogs: [
        {
          id: `log-s1`,
          foodId: "g2", // oats
          name: "Oats (Rolled, Raw)",
          category: "Grains & Cereals",
          weightGrams: 80,
          calories: Math.round((389 * 80) / 100),
          protein: parseFloat(((16.9 * 80) / 100).toFixed(1)),
          carbs: parseFloat(((66.3 * 80) / 100).toFixed(1)),
          fat: parseFloat(((6.9 * 80) / 100).toFixed(1)),
          fiber: parseFloat(((10.6 * 80) / 100).toFixed(1)),
          sodium: Math.round((2 * 80) / 100),
          calcium: Math.round((54 * 80) / 100),
          iron: parseFloat(((4.7 * 80) / 100).toFixed(1)),
          vitaminC: 0,
          potassium: Math.round((429 * 80) / 100),
          magnesium: Math.round((177 * 80) / 100),
          zinc: parseFloat(((4 * 80) / 100).toFixed(1)),
          folate: Math.round((56 * 80) / 100),
          vitaminA: 0,
          water: parseFloat(((8.2 * 80) / 100).toFixed(1)),
          sugar: parseFloat(((1 * 80) / 100).toFixed(1)),
        },
        {
          id: `log-s2`,
          foodId: "p2", // salmon
          name: "Salmon Filet (Cooked, Baked)",
          category: "Proteins",
          weightGrams: 150,
          calories: Math.round((206 * 150) / 100),
          protein: parseFloat(((22.0 * 150) / 100).toFixed(1)),
          carbs: 0,
          fat: parseFloat(((12.3 * 150) / 100).toFixed(1)),
          fiber: 0,
          sodium: Math.round((61 * 150) / 100),
          calcium: Math.round((12 * 150) / 100),
          iron: parseFloat(((0.3 * 150) / 100).toFixed(1)),
          vitaminC: 0,
          potassium: Math.round((384 * 150) / 100),
          magnesium: Math.round((30 * 150) / 100),
          zinc: parseFloat(((0.6 * 150) / 100).toFixed(1)),
          folate: Math.round((5 * 150) / 100),
          vitaminA: Math.round((15 * 150) / 100),
          water: parseFloat(((64 * 150) / 100).toFixed(1)),
          sugar: 0,
        },
        {
          id: `log-s3`,
          foodId: "v1", // broccoli
          name: "Broccoli (Raw)",
          category: "Vegetables",
          weightGrams: 200,
          calories: Math.round((34 * 200) / 100),
          protein: parseFloat(((2.8 * 200) / 100).toFixed(1)),
          carbs: parseFloat(((6.6 * 200) / 100).toFixed(1)),
          fat: parseFloat(((0.4 * 200) / 100).toFixed(1)),
          fiber: parseFloat(((2.6 * 200) / 100).toFixed(1)),
          sodium: Math.round((33 * 200) / 100),
          calcium: Math.round((47 * 200) / 100),
          iron: parseFloat(((0.7 * 200) / 100).toFixed(1)),
          vitaminC: parseFloat(((89.2 * 200) / 100).toFixed(1)),
          potassium: Math.round((316 * 200) / 100),
          magnesium: Math.round((21 * 200) / 100),
          zinc: parseFloat(((0.4 * 200) / 100).toFixed(1)),
          folate: Math.round((63 * 200) / 100),
          vitaminA: Math.round((31 * 200) / 100),
          water: parseFloat(((89.3 * 200) / 100).toFixed(1)),
          sugar: parseFloat(((1.7 * 200) / 100).toFixed(1)),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = [sampleProj, ...get().projects.filter(p => p.id !== sampleId)];
    localStorage.setItem("nutri_platform_projects", JSON.stringify(updatedProjects));
    set({
      projects: updatedProjects,
      currentProjectId: sampleId,
      isSaving: false,
    });
  }
}));
