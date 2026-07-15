import { FoodItem } from "../types";

/**
 * Intelligent parser for NutriSurvey (.fta) and tab/semicolon-delimited database files.
 * Aligns column headers automatically in English and Indonesian.
 */
export function parseFtaDatabase(fileContent: string, defaultSource: string = "BLS"): FoodItem[] {
  const lines = fileContent.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Find header line
  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip comments, empty lines or metadata lines
    if (!line || line.startsWith("*") || line.startsWith("#")) continue;
    
    // Split by possible delimiters
    const tabSplit = line.split("\t");
    const semiSplit = line.split(";");
    const commaSplit = line.split(",");
    
    const possibleHeaders = tabSplit.length > semiSplit.length 
      ? (tabSplit.length > commaSplit.length ? tabSplit : commaSplit)
      : (semiSplit.length > commaSplit.length ? semiSplit : commaSplit);

    // If it has at least Name and Calories/Protein, we assume it's the header
    const hasName = possibleHeaders.some(h => {
      const lower = h.toLowerCase().trim();
      return lower.includes("name") || lower.includes("nama") || lower.includes("makanan") || lower.includes("food");
    });

    if (hasName && possibleHeaders.length >= 3) {
      headerIndex = i;
      headers = possibleHeaders.map(h => h.trim().toLowerCase());
      break;
    }
  }

  // Fallback: If no header line found, assume first line with substantial elements is the header
  if (headerIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("*") || line.startsWith("#")) continue;
      const split = line.split(/[;\t,]/);
      if (split.length >= 4) {
        headerIndex = i;
        headers = split.map((h, idx) => h.trim().toLowerCase() || `column_${idx}`);
        break;
      }
    }
  }

  if (headerIndex === -1) return [];

  const foodItems: FoodItem[] = [];
  const delimiter = lines[headerIndex].includes("\t") 
    ? "\t" 
    : (lines[headerIndex].includes(";") ? ";" : ",");

  // Helper map to match English/Indonesian nutrients
  const nameKeys = ["name", "nama", "food", "makanan", "beverage", "minuman", "bahan"];
  const categoryKeys = ["category", "kategori", "golongan", "group", "jenis"];
  const codeKeys = ["code", "kode", "id", "num", "no"];
  const caloriesKeys = ["calories", "kalori", "energi", "energy", "kcal"];
  const proteinKeys = ["protein", "protein", "prot", "p"];
  const carbsKeys = ["carbohydrates", "karbohidrat", "karbo", "carbs", "c"];
  const fatKeys = ["fat", "lemak", "lipid", "f"];
  const fiberKeys = ["fiber", "serat", "fib"];
  const sodiumKeys = ["sodium", "natrium", "na", "sod"];
  const calciumKeys = ["calcium", "kalsium", "ca"];
  const ironKeys = ["iron", "zat besi", "besi", "fe"];
  const vitaminCKeys = ["vitamin c", "vit c", "vitc", "asorbic"];
  const potassiumKeys = ["potassium", "kalium", "k"];
  const magnesiumKeys = ["magnesium", "mg"];
  const zincKeys = ["zinc", "seng", "zn"];
  const folateKeys = ["folate", "asam folat", "folat", "b9"];
  const vitaminAKeys = ["vitamin a", "vit a", "vita", "retinol"];
  const waterKeys = ["water", "air", "h2o"];
  const sugarKeys = ["sugar", "gula", "sukrosa"];

  const getFieldIndex = (keys: string[]): number => {
    return headers.findIndex(h => keys.some(k => h.includes(k)));
  };

  const nameIdx = getFieldIndex(nameKeys);
  const categoryIdx = getFieldIndex(categoryKeys);
  const codeIdx = getFieldIndex(codeKeys);
  const caloriesIdx = getFieldIndex(caloriesKeys);
  const proteinIdx = getFieldIndex(proteinKeys);
  const carbsIdx = getFieldIndex(carbsKeys);
  const fatIdx = getFieldIndex(fatKeys);
  const fiberIdx = getFieldIndex(fiberKeys);
  const sodiumIdx = getFieldIndex(sodiumKeys);
  const calciumIdx = getFieldIndex(calciumKeys);
  const ironIdx = getFieldIndex(ironKeys);
  const vitCIdx = getFieldIndex(vitaminCKeys);
  const potIdx = getFieldIndex(potassiumKeys);
  const magIdx = getFieldIndex(magnesiumKeys);
  const zincIdx = getFieldIndex(zincKeys);
  const folIdx = getFieldIndex(folateKeys);
  const vitAIdx = getFieldIndex(vitaminAKeys);
  const waterIdx = getFieldIndex(waterKeys);
  const sugarIdx = getFieldIndex(sugarKeys);

  // Process data lines
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("*") || line.startsWith("#")) continue;

    const cells = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ""));
    if (cells.length < 2 || !cells[nameIdx]) continue;

    const parseNum = (val: string | undefined): number => {
      if (!val) return 0;
      const num = parseFloat(val.replace(",", "."));
      return isNaN(num) ? 0 : num;
    };

    const foodName = cells[nameIdx];
    const categoryName = categoryIdx !== -1 && cells[categoryIdx] ? cells[categoryIdx] : "Imported Food";

    const foodItem: FoodItem = {
      id: `fta-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      name: foodName,
      category: categoryName,
      code: codeIdx !== -1 ? cells[codeIdx] : `IMP-${i}`,
      databaseSource: defaultSource as any,
      portions: [{ name: "100g", weightGrams: 100 }],
      
      calories: parseNum(cells[caloriesIdx]),
      protein: parseNum(cells[proteinIdx]),
      carbs: parseNum(cells[carbsIdx]),
      fat: parseNum(cells[fatIdx]),
      fiber: fiberIdx !== -1 ? parseNum(cells[fiberIdx]) : 0,
      sodium: sodiumIdx !== -1 ? parseNum(cells[sodiumIdx]) : 0,
      calcium: calciumIdx !== -1 ? parseNum(cells[calciumIdx]) : 0,
      iron: ironIdx !== -1 ? parseNum(cells[ironIdx]) : 0,
      vitaminC: vitCIdx !== -1 ? parseNum(cells[vitCIdx]) : 0,
      potassium: potIdx !== -1 ? parseNum(cells[potIdx]) : 0,
      magnesium: magIdx !== -1 ? parseNum(cells[magIdx]) : 0,
      zinc: zincIdx !== -1 ? parseNum(cells[zincIdx]) : 0,
      folate: folIdx !== -1 ? parseNum(cells[folIdx]) : 0,
      vitaminA: vitAIdx !== -1 ? parseNum(cells[vitAIdx]) : 0,
      water: waterIdx !== -1 ? parseNum(cells[waterIdx]) : 75.0,
      sugar: sugarIdx !== -1 ? parseNum(cells[sugarIdx]) : 0,
    };

    foodItems.push(foodItem);
  }

  return foodItems;
}
