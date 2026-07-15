// translations.ts - Kamus Lokal Bahasa Indonesia untuk Nutri-Intelligence (v2.4.0)

export const nutrientTranslations: Record<string, string> = {
  energy: "Energi",
  calories: "Energi",
  protein: "Protein",
  carbs: "Karbohidrat",
  carbohydrates: "Karbohidrat",
  fat: "Lemak Total",
  fats: "Lemak Total",
  totalFats: "Lemak Total",
  fiber: "Serat Pangan",
  sodium: "Natrium (Sodium)",
  calcium: "Kalsium",
  iron: "Zat Besi",
  zinc: "Seng (Zinc)",
  magnesium: "Magnesium",
  potassium: "Kalium (Potassium)",
  folate: "Asam Folat",
  vitaminA: "Vitamin A",
  vitaminC: "Vitamin C",
  water: "Air",
  sugar: "Gula",
  
  // Advanced Telemetry & Absorption factors
  phytic_acid: "Asam Fitat",
  calcium_absorb: "Absorpsi Kalsium",
  zinc_absorb: "Absorpsi Seng (Zinc)",
  iron_absorb: "Absorpsi Zat Besi",
  fatSaturated: "Lemak Jenuh",
  fatMonounsaturated: "Lemak Tak Jenuh Tunggal",
  fatPolyunsaturated: "Lemak Tak Jenuh Ganda",
  cholesterol: "Kolesterol",
  
  // Vitamins
  vitaminB1: "Vit. B1 (Thiamin)",
  vitaminB2: "Vit. B2 (Riboflavin)",
  niacin: "Niasin (eq)",
  vitaminB6: "Vit. B6",
  pantothenicAcid: "Asam Pantotenat",
  vitaminB12: "Vit. B12",
  retinol: "Retinol (eq)",
};

export const uiTranslations: Record<string, string> = {
  // General UI
  totalAnalysis: "Analisis Total",
  nutrientRequirements: "Kebutuhan Nutrisi",
  minAmount: "Jml. Min.",
  maxAmount: "Jml. Maks.",
  price: "Harga/100g",
  addFood: "Tambah Makanan",
  searchFood: "Cari Makanan...",
  quantity: "Jumlah (g)",
  portion: "Porsi",
  calculate: "Hitung (Calculate)",
  saveAs: "Simpan (Save as)",
  help: "Bantuan (Help)",
  actions: "Aksi",
  
  // Food Groups translation
  grains_roots: "Serealia & Umbi",
  legumes: "Kacang-kacangan",
  dairy: "Produk Susu",
  meat_fish_egg: "Daging/Ikan/Telur",
  vitA_rich: "Sayuran/Buah Kaya Vit A",
  other_veg_fruit: "Buah/Sayur Lainnya",
  oils_fats: "Minyak & Lemak",
};

export const getNutrientLabel = (key: string): string => {
  const normalizedKey = key.toLowerCase();
  for (const [k, v] of Object.entries(nutrientTranslations)) {
    if (k.toLowerCase() === normalizedKey) {
      return v;
    }
  }
  return key;
};

export const getUiLabel = (key: string): string => {
  return uiTranslations[key] || key;
};
