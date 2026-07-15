import { FoodItem } from "../types";
import { COMPLETE_INDONESIAN_FOODS } from "../data/indonesian-foods-complete";
import { getRegionalFoodItems } from "../data/regional-cuisines";
import { COMPLETE_TRADITIONAL_SNACKS } from "../data/traditional-snacks-complete";
import { COMPLETE_BEVERAGES } from "../data/beverages-complete";
import { COMPLETE_SPICES } from "../data/spices-complete";
import { COMPLETE_CEREMONIAL_FOODS } from "../data/ceremonial-foods";
import { COMPLETE_MEDICINAL_FOODS } from "../data/medicinal-foods";
import { COMPLETE_STREET_FOODS } from "../data/street-foods";
import { oilsAndFatsDatabase } from "../data/oils-and-fats-complete";

// Map OilAndFatItem to global clinical FoodItem format
function getOilsAndFatsAsFoodItems(): FoodItem[] {
  return oilsAndFatsDatabase.map((oil) => {
    const sfa = oil.fattyAcidProfile.sfa;
    const mufa = oil.fattyAcidProfile.mufa;
    const pufa = oil.fattyAcidProfile.pufa;
    const totalFat = Number((sfa + mufa + pufa).toFixed(1));
    const calories = Math.round(totalFat * 9);

    const isButterOrMargarin = oil.name.toLowerCase().includes("butter") || 
                              oil.name.toLowerCase().includes("mentega") || 
                              oil.name.toLowerCase().includes("margarin");
    const isSalted = oil.name.toLowerCase().includes("salted") || 
                     oil.name.toLowerCase().includes("blue band") || 
                     oil.name.toLowerCase().includes("simas") || 
                     oil.name.toLowerCase().includes("palmia");
    const isHewani = oil.name.toLowerCase().includes("butter") || 
                     oil.name.toLowerCase().includes("mentega") || 
                     oil.name.toLowerCase().includes("ghee") || 
                     oil.name.toLowerCase().includes("kambing") || 
                     oil.name.toLowerCase().includes("sapi") || 
                     oil.name.toLowerCase().includes("kerbau");

    const protein = isButterOrMargarin && isHewani ? 0.8 : 0;
    const carbs = isButterOrMargarin && isHewani ? 0.1 : 0;
    const sodium = isSalted ? 750 : (isButterOrMargarin ? 500 : 0);
    const calcium = isButterOrMargarin ? 24 : 0;
    const potassium = isButterOrMargarin ? 24 : 0;
    const cholesterol = isHewani ? (oil.name.toLowerCase().includes("ghee") ? 256 : 215) : 0;
    
    const water = isButterOrMargarin ? Number((100 - totalFat - protein - carbs).toFixed(1)) : 0.0;

    return {
      id: oil.id,
      code: `OIL-${oil.id.split("_").pop()}`,
      name: oil.name,
      category: "Fats, Seeds & Nuts",
      databaseSource: "INDONESIAN",
      synonyms: `${oil.brand}, ${oil.category}, minyak goreng, lemak, ${oil.recommendedUse}`,
      portions: [
        { name: "1 Sendok makan (1 tbsp)", weightGrams: 14 },
        { name: "1 Sendok teh (1 tsp)", weightGrams: 5 },
        { name: "1 Gelas kecil (100ml)", weightGrams: 92 }
      ],
      calories,
      protein,
      carbs,
      fat: totalFat,
      fiber: 0,
      sodium,
      calcium,
      iron: 0,
      vitaminC: 0,
      potassium,
      magnesium: 0,
      zinc: 0,
      folate: 0,
      vitaminA: Math.round(oil.micronutrients.carotenoids * 167), // Approximate carotenoids to mcg RAE
      water,
      sugar: 0,
      fatSaturated: sfa,
      fatMonounsaturated: mufa,
      fatPolyunsaturated: pufa,
      cholesterol,
      price_per_100g: oil.estimatedPrice100ml,
      culturalSignificance: "Digunakan sebagai media memasak utama khas Indonesia (menggoreng, menumis, olesan).",
      storageMethod: isButterOrMargarin ? "Lemari Pendingin (Refrigerator)" : "Suhu Ruang, Wadah Tertutup, Hindari Cahaya Langsung",
      shelfLifeDays: isButterOrMargarin ? 180 : 365,
      allergens: isHewani ? ["Susu (Dairy)"] : (oil.category.toLowerCase().includes("kacang") ? ["Kacang Tanah (Peanuts)"] : undefined),
    } as FoodItem;
  });
}

// Helper to consolidate all Indonesian databases into a single array
export function consolidateAllIndonesianFoods(): FoodItem[] {
  const allFoods: FoodItem[] = [
    ...COMPLETE_INDONESIAN_FOODS,
    ...getRegionalFoodItems(),
    ...COMPLETE_TRADITIONAL_SNACKS,
    ...COMPLETE_BEVERAGES,
    ...COMPLETE_SPICES,
    ...COMPLETE_CEREMONIAL_FOODS,
    ...COMPLETE_MEDICINAL_FOODS,
    ...COMPLETE_STREET_FOODS,
    ...getOilsAndFatsAsFoodItems()
  ];

  console.log(`Consolidated database successfully: ${allFoods.length} items integrated (including 153 Oils & Fats).`);
  return allFoods;
}
