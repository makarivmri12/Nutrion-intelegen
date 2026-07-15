import { FoodItem } from "../types";
import { BASE_NUTRITION_TEMPLATES } from "./indonesian-foods-complete";

export interface CeremonialFoodEntry {
  name: string;
  ceremony: string;
  symbolism: string;
  ingredientsDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const CEREMONIAL_FOOD_TEMPLATES: CeremonialFoodEntry[] = [
  {
    name: "Tumpeng Agung Nasi Kuning",
    ceremony: "Slametan, Syukuran, Pernikahan",
    symbolism: "Bentuk kerucut melambangkan gunung suci (mahameru) dan rasa syukur ke hadirat Tuhan Yang Maha Esa.",
    ingredientsDescription: "Nasi kuning, ayam goreng, perkedel kentang, telur balado, tempe orek kering, abon sapi, timun.",
    calories: 240, protein: 12.5, carbs: 32.0, fat: 8.5
  },
  {
    name: "Bubur Merah Putih Sesaji",
    ceremony: "Kelahiran, Pemberian Nama Bayi, Tolak Bala",
    symbolism: "Bubur merah melambangkan ibu (darah), bubur putih melambangkan bapak (benih), penyatuan kehidupan baru.",
    ingredientsDescription: "Beras putih kukus, santan kelapa, gula aren merah asli, daun pandan harum, sedikit garam.",
    calories: 180, protein: 3.1, carbs: 38.0, fat: 4.2
  },
  {
    name: "Apem Kukus Ruwatan",
    ceremony: "Ruwatan, Mengirim Doa Leluhur (Megengan)",
    symbolism: "Kata 'apem' diserap dari bahasa arab 'afwan' yang berarti memohon maaf kepada sang pencipta.",
    ingredientsDescription: "Tepung beras fermentasi tape singkong, santan kental, gula pasir, ragi pengembang.",
    calories: 155, protein: 2.1, carbs: 31.0, fat: 2.5
  },
  {
    name: "Jenang Sengkolo",
    ceremony: "Pernikahan Tradisional Jawa, Khitanan",
    symbolism: "Menghalau kesialan dan menyambut keberkahan bagi pengantin atau anak.",
    ingredientsDescription: "Beras ketan putih giling, santan gurih, sirup gula jawa kental.",
    calories: 210, protein: 4.0, carbs: 42.0, fat: 3.8
  },
  {
    name: "Nasi Liwet Slametan",
    ceremony: "Syukuran Rumah Baru, Pertemuan Warga",
    symbolism: "Melambangkan kerukunan, kesetaraan, dan kebersamaan erat antar tetangga kampung.",
    ingredientsDescription: "Nasi gurih beraroma serai, daun salam, bawang merah, ikan asin jambal roti goreng, petai.",
    calories: 165, protein: 4.5, carbs: 29.5, fat: 3.0
  }
];

export function compileCeremonialFoods(): FoodItem[] {
  const finalFoods: FoodItem[] = [];
  let idCounter = 50000;

  CEREMONIAL_FOOD_TEMPLATES.forEach((tmpl, idx) => {
    finalFoods.push({
      id: `id_ceremonial_${idCounter}`,
      code: `CERM${String(idCounter).padStart(5, "0")}`,
      name: tmpl.name,
      category: "Grains & Cereals",
      databaseSource: "INDONESIAN",
      synonyms: `${tmpl.name.toLowerCase()}, sesaji slametan, makanan adat`,
      portions: [
        { name: "1 Porsi Piring Saji", weightGrams: 220 },
        { name: "100 Gram", weightGrams: 100 }
      ],
      calories: tmpl.calories,
      protein: tmpl.protein,
      carbs: tmpl.carbs,
      fat: tmpl.fat,
      fiber: 1.2,
      sodium: 180,
      calcium: 35,
      iron: 0.9,
      vitaminC: 0,
      potassium: 120,
      magnesium: 15,
      zinc: 0.4,
      folate: 4,
      vitaminA: 5,
      water: 60.0,
      sugar: 8.0,
      price_per_100g: 7500,
      culturalSignificance: `Hidangan ritual ${tmpl.ceremony}. Makna filosofis: ${tmpl.symbolism}`,
      seasonality: "Khusus Ritual",
      cookingTime: 60,
      difficulty: "hard",
      ceremonialUse: tmpl.ceremony.split(", "),
      dietaryRestrictions: {
        vegetarian: tmpl.name.includes("Apem") || tmpl.name.includes("Bubur"),
        vegan: tmpl.name.includes("Apem") || tmpl.name.includes("Bubur"),
        halal: true,
        kosher: false,
        glutenFree: tmpl.name.includes("Bubur")
      },
      popularity: {
        national: true,
        regions: ["Jawa", "Sunda", "Madura"],
        rating: 4.9
      }
    });
    idCounter++;
  });

  return finalFoods;
}

export const COMPLETE_CEREMONIAL_FOODS = compileCeremonialFoods();
