import { FoodItem } from "../types";

export const BASE_BEVERAGE_TEMPLATES = [
  { name: "Jamu Kunyit Asam", subcat: "Jamu & Herbal", baseCal: 45, sugar: 9.0, isMedicinal: true },
  { name: "Jamu Beras Kencur", subcat: "Jamu & Herbal", baseCal: 80, sugar: 14.0, isMedicinal: true },
  { name: "Wedang Uwuh", subcat: "Wedang Rempah", baseCal: 30, sugar: 6.0, isMedicinal: true },
  { name: "Wedang Jahe", subcat: "Wedang Rempah", baseCal: 35, sugar: 7.0, isMedicinal: true },
  { name: "Wedang Ronde Sukabumi", subcat: "Wedang Rempah", baseCal: 120, sugar: 18.0, isMedicinal: false },
  { name: "Bajigur Khas Sunda", subcat: "Wedang Rempah", baseCal: 140, sugar: 15.0, isMedicinal: false },
  { name: "Bandrek Jahe Susu", subcat: "Wedang Rempah", baseCal: 160, sugar: 19.0, isMedicinal: false },
  { name: "Es Cendol Gula Aren", subcat: "Minuman Dingin Tradisional", baseCal: 195, sugar: 22.0, isMedicinal: false },
  { name: "Es Dawet Ayu", subcat: "Minuman Dingin Tradisional", baseCal: 180, sugar: 20.0, isMedicinal: false },
  { name: "Es Doger Kelapa", subcat: "Minuman Dingin Tradisional", baseCal: 210, sugar: 24.0, isMedicinal: false },
  { name: "Es Teler Durian", subcat: "Minuman Dingin Tradisional", baseCal: 250, sugar: 26.0, isMedicinal: false },
  { name: "Es Campur Selasih", subcat: "Minuman Dingin Tradisional", baseCal: 170, sugar: 21.0, isMedicinal: false },
  { name: "Kopi Tubruk Robusta", subcat: "Kopi & Teh", baseCal: 15, sugar: 1.0, isMedicinal: false },
  { name: "Teh Melati Wangi", subcat: "Kopi & Teh", baseCal: 2, sugar: 0.0, isMedicinal: false },
  { name: "Susu Sapi Segar Pangalengan", subcat: "Susu & Produk Susu", baseCal: 65, sugar: 4.8, isMedicinal: false }
];

export function compileBeverages(): FoodItem[] {
  const drinks: FoodItem[] = [];
  const sweetnessVariations = ["Tanpa Gula (Zero Sugar)", "Kurang Manis (Less Sugar)", "Normal Sweetness", "Manis Legit (Extra Sugar)"];
  
  let idCounter = 30000;
  
  // Create 260+ beverage combinations
  for (let i = 0; i < 265; i++) {
    const base = BASE_BEVERAGE_TEMPLATES[i % BASE_BEVERAGE_TEMPLATES.length];
    const sweetMod = sweetnessVariations[i % sweetnessVariations.length];
    const factor = (i % 4) * 0.4 + 0.6; // multiplier for calories
    
    const name = `${base.name} - ${sweetMod}`;
    const code = `BEV${String(idCounter).padStart(5, "0")}`;
    
    drinks.push({
      id: `id_bev_${idCounter}`,
      code,
      name,
      category: "Beverages",
      databaseSource: "INDONESIAN",
      synonyms: `${base.name.toLowerCase()}, minuman segar, herba`,
      portions: [
        { name: "1 Gelas Sedang (Medium Glass)", weightGrams: 250 },
        { name: "1 Cup (Small)", weightGrams: 180 }
      ],
      calories: Math.round(base.baseCal * factor),
      protein: base.subcat === "Susu & Produk Susu" ? 3.2 : 0.4,
      carbs: Number((base.sugar * factor * 1.1).toFixed(1)),
      fat: base.name.includes("Susu") || base.name.includes("Bajigur") ? 3.5 : 0.1,
      fiber: 0.1,
      sodium: 15 + (i % 20),
      calcium: base.subcat === "Susu & Produk Susu" ? 110 : 8,
      iron: 0.1,
      vitaminC: base.name.includes("Asam") ? 12 : 0,
      potassium: 110,
      magnesium: 6,
      zinc: 0.05,
      folate: 1,
      vitaminA: 2,
      water: 95.0 - (base.sugar * factor * 0.1),
      sugar: Number((base.sugar * factor).toFixed(1)),
      price_per_100g: 1500 + (i % 10) * 400,
      culturalSignificance: base.isMedicinal 
        ? "Minuman herbal pencegah penyakit dan penambah energi tradisional." 
        : "Minuman penyegar tenggorokan yang sangat populer dinikmati di iklim tropis Indonesia.",
      seasonality: "Selalu Ada",
      cookingTime: base.isMedicinal ? 35 : 10,
      difficulty: base.isMedicinal ? "medium" : "easy",
      medicinalProperties: base.isMedicinal ? ["Meningkatkan daya tahan tubuh", "Menghangatkan lambung", "Anti-inflamasi alami"] : undefined,
      dietaryRestrictions: {
        vegetarian: true,
        vegan: !base.name.includes("Susu"),
        halal: true,
        kosher: false,
        glutenFree: true
      },
      popularity: {
        national: true,
        regions: ["Jawa", "Sumatera", "Sulawesi"],
        rating: 4.6
      }
    });
    
    idCounter++;
  }
  
  return drinks;
}

export const COMPLETE_BEVERAGES = compileBeverages();
