export interface PatientProfile {
  id: string;
  name: string;
  age: number; // in years (can support fractional/decimal for pediatrics)
  gender: "Male" | "Female";
  height: number; // in cm
  weight: number; // in kg
  activityLevel: "Sedentary" | "Lightly Active" | "Moderately Active" | "Very Active";
  conditions: string;
  notes: string;
  bmi: number;
  bmiCategory: string;
  bmr: number; // Basal Metabolic Rate
  phone?: string;
  dob?: string;
  
  // Phase 5.7: Gestational and Pediatric metadata
  pregnancyStatus?: 'none' | 'trimester1' | 'trimester2' | 'trimester3';
  lactationStatus?: 'none' | 'months0to6' | 'months7to12';
  ageMonths?: number; // Precise age in months for pediatric Z-score (0-60m)
  
  // Phase 5.8: Medication tracking
  medications?: string[]; // List of drug names active for patient
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;   // per 100g
  protein: number;    // per 100g (g)
  carbs: number;      // per 100g (g)
  fat: number;        // per 100g (g)
  fiber: number;      // per 100g (g)
  sodium: number;     // per 100g (mg)
  calcium: number;    // per 100g (mg)
  iron: number;       // per 100g (mg)
  vitaminC: number;   // per 100g (mg)
  potassium: number;  // per 100g (mg)
  magnesium: number;  // per 100g (mg)
  zinc: number;       // per 100g (mg)
  folate: number;     // per 100g (mcg)
  vitaminA: number;   // per 100g (mcg)
  water: number;      // per 100g (g)
  sugar: number;      // per 100g (g)

  // Expanded fields for Phase 2: NutriSurvey Alignment
  code?: string;
  synonyms?: string;
  databaseSource?: "BLS" | "USDA" | "FAO" | "INDONESIAN" | "BRAZILIAN" | "GUATEMALA" | "INDIAN" | "KENYA" | "EGYPT" | "BOLIVIAN";
  portions?: { name: string; weightGrams: number }[];
  fatSaturated?: number;        // per 100g (g)
  fatMonounsaturated?: number;  // per 100g (g)
  fatPolyunsaturated?: number;  // per 100g (g)
  cholesterol?: number;         // per 100g (mg)
  tryptophan?: number;          // per 100g (mg)
  leucine?: number;             // per 100g (mg)
  lysine?: number;              // per 100g (mg)
  methionine?: number;          // per 100g (mg)
  phenylalanine?: number;       // per 100g (mg)
  valine?: number;              // per 100g (mg)

  // Added in Phase 5.5: Advanced NutriSurvey Alignment
  price_per_100g?: number;      // IDR
  phytic_acid?: number;         // mg
  calcium_absorb_factor?: number; // 0.0 to 1.0 (multiplier)
  zinc_absorb_factor?: number;    // 0.0 to 1.0 (multiplier)
  iron_absorb_factor?: number;    // 0.0 to 1.0 (multiplier)
  vitaminB1?: number;           // mg
  vitaminB2?: number;           // mg
  niacin?: number;              // mg
  vitaminB6?: number;           // mg
  pantothenicAcid?: number;     // mg
  vitaminB12?: number;          // mcg
  retinol?: number;             // mcg

  // Advanced Indonesian Food Metadata Fields
  culturalSignificance?: string;  // Pentingnya dalam budaya (upacara, harian, dll)
  seasonality?: string;           // Musiman (tahunan, musiman, selalu ada)
  cookingTime?: number;           // Waktu masak (menit)
  difficulty?: 'easy' | 'medium' | 'hard';
  ceremonialUse?: string[];       // Upacara apa (pernikahan, khitanan, dll)
  medicinalProperties?: string[];  // Khasiat kesehatan
  shelfLifeDays?: number;         // Daya simpan (hari)
  storageMethod?: string;         // Cara simpan (kulkas, suhu ruang)
  allergens?: string[];           // Alergen
  dietaryRestrictions?: {
    vegetarian: boolean;
    vegan: boolean;
    halal: boolean;
    kosher: boolean;
    glutenFree: boolean;
  };
  popularity?: {
    national: boolean;
    regions: string[];            // Provinsi populer
    rating: number;               // 1-5
  };
  variations?: string[];          // Variasi regional
  relatedFoods?: string[];        // Makanan terkait
  history?: string;               // Sejarah singkat
  servingSuggestions?: string[];  // Cara penyajian
  pairings?: string[];            // Pasangan makanan
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  name: string;
  category: string;
  weightGrams: number; // Consumed weight (cooked weight)
  portionName?: string; // e.g. "1 Cup (150g)"
  cookingMethod?: string; // Phase 5.5: 'Mentah' | 'Rebus' | 'Kukus' | 'Goreng' | 'Panggang' | 'Bakar' | 'Microwave'
  rawWeightGrams?: number; // Weight before cooking
  
  // Calculated dynamically
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  folate: number;
  vitaminA: number;
  water: number;
  sugar: number;

  // Detailed fatty acids and amino acids
  fatSaturated?: number;
  fatMonounsaturated?: number;
  fatPolyunsaturated?: number;
  cholesterol?: number;
  tryptophan?: number;
  leucine?: number;
  lysine?: number;
  methionine?: number;
  phenylalanine?: number;
  valine?: number;

  // Added in Phase 5.5: Advanced NutriSurvey Alignment
  price_per_100g?: number;
  phytic_acid?: number;
  calcium_absorb_factor?: number;
  zinc_absorb_factor?: number;
  iron_absorb_factor?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  niacin?: number;
  vitaminB6?: number;
  pantothenicAcid?: number;
  vitaminB12?: number;
  retinol?: number;
}

export interface NutrientTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  folate: number;
  vitaminA: number;
  water: number;
  sugar: number;

  // Detailed targets
  fatSaturated?: number;
  fatMonounsaturated?: number;
  fatPolyunsaturated?: number;
  cholesterol?: number;
}

export interface Project {
  id: string;
  name: string;
  patientProfile: PatientProfile;
  foodLogs: FoodLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export enum AppTab {
  SPREADSHEET = "SPREADSHEET",
  PATIENT_PROFILE = "PATIENT_PROFILE",
  AI_INTELLIGENCE = "AI_INTELLIGENCE",
  FOOD_DATABASE = "FOOD_DATABASE",
  ANALYTICS = "ANALYTICS",
  FFQ_DIET = "FFQ_DIET",
  OPTIMIZER = "OPTIMIZER",
  REPORTS = "REPORTS",
  SETTINGS = "SETTINGS",
  HELP = "HELP",
}
