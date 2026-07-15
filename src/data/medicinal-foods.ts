import { FoodItem } from "../types";

export interface MedicinalFoodEntry {
  name: string;
  indication: string;
  benefit: string;
  ingredientsDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const MEDICINAL_FOOD_TEMPLATES: MedicinalFoodEntry[] = [
  {
    name: "Jamu Kunyit Asam Herbal",
    indication: "Nyeri Haid, Letih Lesu, Radang Sendi",
    benefit: "Antiinflamasi alami kurkuminoid membantu meredakan inflamasi lambung dan kram tubuh.",
    ingredientsDescription: "Kunyit segar diparut, asam jawa matang, gula aren kelapa, garam laut.",
    calories: 42, protein: 0.5, carbs: 10.2, fat: 0.1
  },
  {
    name: "Bubur Sumsum Halus Pemulihan",
    indication: "Pasca Sakit, Gangguan Pencernaan, Pemulihan Energi",
    benefit: "Karbohidrat tepung beras yang sangat halus sangat mudah dicerna dinding lambung yang rapuh.",
    ingredientsDescription: "Tepung beras murni, santan encer, kuah kental sirup gula merah hangat.",
    calories: 135, protein: 1.8, carbs: 28.5, fat: 2.1
  },
  {
    name: "Sop Ayam Kampung Jahe Emprit",
    indication: "Flu, Demam, Masuk Angin, Menggigil",
    benefit: "Zat aktif gingerol merangsang keringat hangat, meredakan hidung tersumbat, mempercepat kesembuhan flu.",
    ingredientsDescription: "Daging ayam kampung fillet, jahe emprit bakar geprek, bawang putih melimpah, seledri segar.",
    calories: 145, protein: 14.0, carbs: 2.5, fat: 8.5
  },
  {
    name: "Wedang Temulawak Maag",
    indication: "Nafsu Makan Rendah, Gejala Maag kronis",
    benefit: "Memacu produksi cairan empedu lambung untuk mengolah lemak dan menekan peningkatan asam lambung berlebih.",
    ingredientsDescription: "Irisan temulawak kering sangrai, daun mint liar, madu hutan kelulut.",
    calories: 55, protein: 0.2, carbs: 13.5, fat: 0.1
  }
];

export function compileMedicinalFoods(): FoodItem[] {
  const finalFoods: FoodItem[] = [];
  let idCounter = 60000;

  MEDICINAL_FOOD_TEMPLATES.forEach((tmpl, idx) => {
    finalFoods.push({
      id: `id_medicinal_${idCounter}`,
      code: `MEDC${String(idCounter).padStart(5, "0")}`,
      name: tmpl.name,
      category: tmpl.name.includes("Sop") ? "Proteins" : "Beverages",
      databaseSource: "INDONESIAN",
      synonyms: `${tmpl.name.toLowerCase()}, ramuan obat tradisional, jamu kesehatan`,
      portions: [
        { name: "1 Mangkok Saji", weightGrams: 200 },
        { name: "1 Gelas Saji", weightGrams: 150 }
      ],
      calories: tmpl.calories,
      protein: tmpl.protein,
      carbs: tmpl.carbs,
      fat: tmpl.fat,
      fiber: 0.4,
      sodium: 40,
      calcium: 15,
      iron: 0.8,
      vitaminC: tmpl.name.includes("Kunyit") ? 6.0 : 0.2,
      potassium: 110,
      magnesium: 12,
      zinc: 0.1,
      folate: 2,
      vitaminA: 10,
      water: 80.0,
      sugar: 6.0,
      price_per_100g: 4500,
      culturalSignificance: `Makanan obat tradisional berkhasiat tinggi. Kegunaan utama: ${tmpl.indication}. Manfaat klinis: ${tmpl.benefit}`,
      seasonality: "Selalu Ada",
      cookingTime: 30,
      difficulty: "easy",
      medicinalProperties: [tmpl.indication, tmpl.benefit],
      dietaryRestrictions: {
        vegetarian: !tmpl.name.includes("Ayam"),
        vegan: !tmpl.name.includes("Ayam"),
        halal: true,
        kosher: false,
        glutenFree: true
      },
      popularity: {
        national: true,
        regions: ["Seluruh Indonesia"],
        rating: 4.7
      }
    });
    idCounter++;
  });

  return finalFoods;
}

export const COMPLETE_MEDICINAL_FOODS = compileMedicinalFoods();
