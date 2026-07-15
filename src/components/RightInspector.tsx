import React, { useMemo } from "react";
import { useNutriStore, calculateNutrientTargets } from "../store/useNutriStore";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { 
  AlertTriangle, 
  CheckCircle, 
  BarChart4, 
  TrendingUp, 
  Zap, 
  ShieldCheck,
  Activity,
  ChevronRight,
  Database
} from "lucide-react";
import { nutrientTranslations, getNutrientLabel } from "../utils/translations";

export default function RightInspector() {
  const { projects, currentProjectId } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);

  const logs = activeProject ? activeProject.foodLogs : [];
  const profile = activeProject ? activeProject.patientProfile : null;

  // Categorize food logs into required food groups breakdown
  const foodGroupsBreakdown = useMemo(() => {
    const groups = {
      grains_roots: 0,       // Serealia & Umbi
      legumes: 0,            // Kacang-kacangan
      dairy: 0,              // Produk Susu
      meat_fish_egg: 0,      // Daging/Ikan/Telur
      vitA_rich: 0,          // Sayuran/Buah kaya Vit A
      other_veg_fruit: 0,    // Buah/Sayur Lainnya
      oils_fats: 0,          // Minyak & Lemak
      other: 0               // Lainnya
    };

    logs.forEach((log) => {
      const name = log.name.toLowerCase();
      const category = (log.category || "").toLowerCase();
      const weight = log.weightGrams || 0;

      if (name.includes("susu") || name.includes("keju") || name.includes("yogurt") || name.includes("milk") || name.includes("cheese") || category.includes("dairy")) {
        groups.dairy += weight;
      } else if (name.includes("tempe") || name.includes("tahu") || name.includes("kacang") || name.includes("beans") || name.includes("soy") || name.includes("nut")) {
        groups.legumes += weight;
      } else if (name.includes("minyak") || name.includes("mentega") || name.includes("oil") || name.includes("butter") || name.includes("margarin") || name.includes("santan") || name.includes("fat") || name.includes("lemak")) {
        groups.oils_fats += weight;
      } else if (name.includes("ayam") || name.includes("daging") || name.includes("ikan") || name.includes("telur") || name.includes("beef") || name.includes("chicken") || name.includes("fish") || name.includes("egg") || name.includes("pork") || category.includes("protein") || category.includes("meat")) {
        groups.meat_fish_egg += weight;
      } else if (log.vitaminA > 100 || name.includes("wortel") || name.includes("bayam") || name.includes("carrot") || name.includes("spinach") || name.includes("pepaya") || name.includes("papaya") || name.includes("mangga") || name.includes("mango")) {
        groups.vitA_rich += weight;
      } else if (category.includes("fruit") || category.includes("vegetable") || name.includes("sayur") || name.includes("buah") || name.includes("pisang") || name.includes("banana") || name.includes("apel") || name.includes("apple") || name.includes("jeruk") || name.includes("orange")) {
        groups.other_veg_fruit += weight;
      } else if (category.includes("grain") || category.includes("cereal") || category.includes("tuber") || name.includes("nasi") || name.includes("beras") || name.includes("rice") || name.includes("gandum") || name.includes("singkong") || name.includes("kentang") || name.includes("potato") || name.includes("cassava") || name.includes("roti") || name.includes("bread") || name.includes("mie") || name.includes("noodle")) {
        groups.grains_roots += weight;
      } else {
        groups.other += weight;
      }
    });

    return groups;
  }, [logs]);

  // Compute Totals and estimated clinical factors
  const totals = useMemo(() => {
    return logs.reduce((acc, log) => {
      const scale = (log.weightGrams || 100) / 100;
      const category = (log.category || "").toLowerCase();

      // Core Macros
      acc.calories += log.calories || 0;
      acc.protein += log.protein || 0;
      acc.carbs += log.carbs || 0;
      acc.fat += log.fat || 0;
      acc.sodium += log.sodium || 0;
      acc.fiber += log.fiber || 0;
      acc.sugar += log.sugar || 0;

      // Minerals
      acc.calcium += log.calcium || 0;
      acc.iron += log.iron || 0;
      acc.zinc += log.zinc !== undefined ? log.zinc : (log.zinc || 0);
      acc.magnesium += log.magnesium !== undefined ? log.magnesium : (log.magnesium || 0);

      // Phytic acid fallback
      const phytic = log.phytic_acid !== undefined ? log.phytic_acid : (
        category.includes("grain") ? 150 * scale :
        category.includes("legumes") ? 300 * scale : 0
      );
      acc.phytic_acid += phytic;

      // Absorption calculations
      const caFactor = log.calcium_absorb_factor !== undefined ? log.calcium_absorb_factor : (
        phytic > 200 ? 0.15 : 0.30
      );
      acc.calcium_absorb += (log.calcium || 0) * caFactor;

      const znFactor = log.zinc_absorb_factor !== undefined ? log.zinc_absorb_factor : (
        phytic > 200 ? 0.15 : 0.25
      );
      acc.zinc_absorb_sum += (log.zinc || 0) * znFactor;

      const feFactor = log.iron_absorb_factor !== undefined ? log.iron_absorb_factor : (
        category.includes("meat") || category.includes("protein") ? 0.18 : 0.08
      );
      acc.iron_absorb += (log.iron || 0) * feFactor;

      // Vitamins
      acc.vitaminB1 += log.vitaminB1 !== undefined ? log.vitaminB1 : (
        category.includes("grain") ? 0.16 * scale :
        category.includes("protein") ? 0.22 * scale : 0.04 * scale
      );
      acc.vitaminB2 += log.vitaminB2 !== undefined ? log.vitaminB2 : (
        category.includes("dairy") ? 0.18 * scale :
        category.includes("protein") ? 0.20 * scale : 0.05 * scale
      );
      acc.niacin += log.niacin !== undefined ? log.niacin : (
        category.includes("protein") ? 6.5 * scale :
        category.includes("grain") ? 1.6 * scale : 0.5 * scale
      );
      acc.vitaminB6 += log.vitaminB6 !== undefined ? log.vitaminB6 : (
        category.includes("protein") ? 0.45 * scale :
        category.includes("grain") ? 0.30 * scale : 0.08 * scale
      );
      acc.pantothenicAcid += log.pantothenicAcid !== undefined ? log.pantothenicAcid : (
        category.includes("protein") ? 0.95 * scale :
        category.includes("dairy") ? 0.50 * scale : 0.20 * scale
      );
      acc.folate += log.folate || 0;
      acc.vitaminB12 += log.vitaminB12 !== undefined ? log.vitaminB12 : (
        category.includes("protein") ? 1.8 * scale :
        category.includes("dairy") ? 0.4 * scale : 0
      );
      acc.vitaminC += log.vitaminC || 0;
      acc.retinol += log.retinol !== undefined ? log.retinol : (
        (log.vitaminA && (category.includes("protein") || category.includes("dairy"))) ? log.vitaminA * 0.8 : 0
      );

      // Advanced Lipids
      acc.fatSaturated += log.fatSaturated || 0;
      acc.fatMonounsaturated += log.fatMonounsaturated || 0;
      acc.fatPolyunsaturated += log.fatPolyunsaturated || 0;
      acc.cholesterol += log.cholesterol || 0;

      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sodium: 0,
      fiber: 0,
      sugar: 0,
      calcium: 0,
      iron: 0,
      zinc: 0,
      magnesium: 0,
      phytic_acid: 0,
      calcium_absorb: 0,
      zinc_absorb_sum: 0,
      iron_absorb: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      niacin: 0,
      vitaminB6: 0,
      pantothenicAcid: 0,
      folate: 0,
      vitaminB12: 0,
      vitaminC: 0,
      retinol: 0,
      fatSaturated: 0,
      fatMonounsaturated: 0,
      fatPolyunsaturated: 0,
      cholesterol: 0
    });
  }, [logs]);

  // Compute targets based on patient profile
  const targets = useMemo(() => {
    if (!profile) return {
      calories: 2000,
      protein: 75,
      carbs: 250,
      fat: 65,
      sodium: 2000,
      fiber: 30,
      calcium: 1000,
      iron: 8,
      zinc: 10,
      magnesium: 350,
      vitaminC: 90,
      sugar: 35,
      fatSaturated: 20,
      cholesterol: 300
    };
    
    const standardTargets = calculateNutrientTargets(profile);
    return {
      ...standardTargets,
      zinc: 11,
      magnesium: 350,
      fatSaturated: Math.round((standardTargets.calories * 0.10) / 9), // Max 10% saturated fat
      cholesterol: 300
    };
  }, [profile]);

  // Calculate macronutrient distribution for PieChart
  const macroChartData = useMemo(() => {
    const proteinCal = totals.protein * 4;
    const carbsCal = totals.carbs * 4;
    const fatCal = totals.fat * 9;
    const totalCal = proteinCal + carbsCal + fatCal;

    if (totalCal === 0) {
      return [
        { name: "Protein", value: 15, color: "#a855f7" },
        { name: "Karbohidrat", value: 55, color: "#eab308" },
        { name: "Lemak", value: 30, color: "#f43f5e" }
      ];
    }

    return [
      { name: "Protein", value: parseFloat(((proteinCal / totalCal) * 100).toFixed(1)), color: "#a855f7" },
      { name: "Karbohidrat", value: parseFloat(((carbsCal / totalCal) * 100).toFixed(1)), color: "#eab308" },
      { name: "Lemak", value: parseFloat(((fatCal / totalCal) * 100).toFixed(1)), color: "#f43f5e" }
    ];
  }, [totals]);

  // Dynamic clinical warnings in Indonesian
  const clinicalWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (totals.sodium > targets.sodium) {
      warnings.push(`Kelebihan Natrium (${totals.sodium.toFixed(0)}mg vs Maks ${targets.sodium}mg): Meningkatkan risiko hipertensi klinis.`);
    }
    if (totals.sugar > targets.sugar) {
      warnings.push(`Kelebihan Gula (${totals.sugar.toFixed(0)}g vs Maks ${targets.sugar}g): Memicu lonjakan kadar glukosa darah.`);
    }
    if (totals.fatSaturated > targets.fatSaturated) {
      warnings.push(`Kelebihan Lemak Jenuh (${totals.fatSaturated.toFixed(1)}g vs Maks ${targets.fatSaturated}g): Meningkatkan marker kolesterol LDL.`);
    }
    if (totals.cholesterol > targets.cholesterol) {
      warnings.push(`Kelebihan Kolesterol (${totals.cholesterol.toFixed(0)}mg vs Maks ${targets.cholesterol}mg): Berisiko aterosklerosis kardiovaskular.`);
    }
    if (totals.calories > targets.calories + 300) {
      warnings.push(`Kelebihan Kalori (+${(totals.calories - targets.calories).toFixed(0)} kkal): Mendorong lipogenesis jaringan adiposa.`);
    }
    if (totals.calories > 0 && totals.calories < targets.calories - 500) {
      warnings.push(`Defisit Kalori Parah (-${(targets.calories - totals.calories).toFixed(0)} kkal): Berisiko katabolisme sistemik.`);
    }
    if (totals.calories > 0 && totals.protein < targets.protein - 15) {
      warnings.push(`Defisit Protein: Asam amino esensial tidak memadai untuk biosintesis jaringan.`);
    }
    return warnings;
  }, [totals, targets]);

  const progressPercentage = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="w-[340px] bg-[#121212] border-l border-[#27272a] p-4 flex flex-col h-full overflow-y-auto select-none font-sans" id="right-inspector-panel">
      
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3 mb-4">
        <BarChart4 className="w-4 h-4 text-[#00d4ff]" />
        <h3 className="text-xs font-semibold text-white tracking-wider font-mono uppercase">
          Analisis Total Real-Time
        </h3>
      </div>

      {/* Macronutrient Calories PieChart Ratio */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded p-3 mb-4">
        <span className="text-[10px] font-mono text-zinc-400 block mb-2 uppercase tracking-wider">
          Distribusi Kalori Makro (%)
        </span>
        
        <div className="h-[120px] flex items-center justify-between">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {macroChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#121212", border: "1px solid #27272a", borderRadius: "4px", fontSize: "10px" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-1/2 space-y-1.5 pl-3">
            {macroChartData.map((macro) => (
              <div key={macro.name} className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: macro.color }} />
                  <span className="text-zinc-400">{macro.name}</span>
                </div>
                <span className="text-white font-bold">{macro.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Progress Bars (Daily Dietary Intake Targets) */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded p-3 space-y-3 mb-4">
        <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
          Target Asupan Harian Pasien
        </span>

        {/* Calorie Goal bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-pink-400" />
              <span>Energi</span>
            </span>
            <span className="text-white">
              {Math.round(totals.calories)} / <span className="text-zinc-500">{targets.calories} kkal</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500 transition-all duration-300"
              style={{ width: `${progressPercentage(totals.calories, targets.calories)}%` }}
            />
          </div>
        </div>

        {/* Protein bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-purple-400 font-medium">Protein</span>
            <span className="text-white">
              {totals.protein.toFixed(1)} / <span className="text-zinc-500">{targets.protein} g</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${progressPercentage(totals.protein, targets.protein)}%` }}
            />
          </div>
        </div>

        {/* Carbs bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-yellow-500 font-medium">Karbohidrat</span>
            <span className="text-white">
              {totals.carbs.toFixed(1)} / <span className="text-zinc-500">{targets.carbs} g</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${progressPercentage(totals.carbs, targets.carbs)}%` }}
            />
          </div>
        </div>

        {/* Fat bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-rose-400 font-medium">Lemak Total</span>
            <span className="text-white">
              {totals.fat.toFixed(1)} / <span className="text-zinc-500">{targets.fat} g</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${progressPercentage(totals.fat, targets.fat)}%` }}
            />
          </div>
        </div>

        {/* Fiber bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-emerald-400 font-medium">Serat Pangan</span>
            <span className="text-white">
              {totals.fiber.toFixed(1)} / <span className="text-zinc-500">{targets.fiber} g</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercentage(totals.fiber, targets.fiber)}%` }}
            />
          </div>
        </div>

        {/* Sodium bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-blue-400 font-medium">Natrium (Sodium)</span>
            <span className="text-white">
              {totals.sodium.toFixed(0)} / <span className="text-zinc-500">{targets.sodium} mg</span>
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage(totals.sodium, targets.sodium)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detail Mikronutrisi (Advanced Telemetry) Section */}
      <div className="bg-[#1a1a1a] border border-zinc-800 rounded p-3 space-y-4 mb-4">
        <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Detail Mikronutrisi (Advanced)</span>
        </span>

        {/* Mineral Absorption Panel */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-[#00d4ff] font-bold font-mono uppercase tracking-wide flex items-center">
            <ChevronRight className="w-3 h-3 text-[#00d4ff] mr-1" />
            <span>Absorpsi Mineral</span>
          </h4>
          
          <div className="space-y-1.5 pl-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Asam Fitat:</span>
              <span className={totals.phytic_acid > 0 ? "text-white" : "text-zinc-600"}>{totals.phytic_acid.toFixed(0)} mg</span>
            </div>
            
            <div className="flex justify-between text-zinc-400">
              <span>Kalsium (Ca):</span>
              <span className={totals.calcium > 0 ? "text-white" : "text-zinc-600"}>
                {totals.calcium.toFixed(0)} mg
                {totals.calcium > 0 && (
                  <span className="text-[10px] text-emerald-400 ml-1">(Abs: {totals.calcium_absorb.toFixed(0)} mg)</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Magnesium (Mg):</span>
              <span className={totals.magnesium > 0 ? "text-white" : "text-zinc-600"}>{totals.magnesium.toFixed(0)} mg</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Seng (Zinc):</span>
              <span className={totals.zinc > 0 ? "text-white" : "text-zinc-600"}>
                {totals.zinc.toFixed(1)} mg
                {totals.zinc > 0 && (
                  <span className="text-[10px] text-[#00d4ff] ml-1">(%Abs: {Math.round((totals.zinc_absorb_sum / (totals.zinc || 1)) * 100)}%)</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Zat Besi (Fe):</span>
              <span className={totals.iron > 0 ? "text-white" : "text-zinc-600"}>
                {totals.iron.toFixed(1)} mg
                {totals.iron > 0 && (
                  <span className="text-[10px] text-pink-400 ml-1">(Abs: {totals.iron_absorb.toFixed(1)} mg)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Vitamins List */}
        <div className="space-y-2 border-t border-zinc-800/60 pt-3">
          <h4 className="text-[10px] text-[#00d4ff] font-bold font-mono uppercase tracking-wide flex items-center">
            <ChevronRight className="w-3 h-3 text-[#00d4ff] mr-1" />
            <span>Profil Vitamin Lengkap</span>
          </h4>

          <div className="grid grid-cols-1 gap-1.5 pl-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Vit. B1 (Thiamin):</span>
              <span className={totals.vitaminB1 > 0 ? "text-white" : "text-zinc-600"}>{totals.vitaminB1.toFixed(2)} mg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vit. B2 (Riboflavin):</span>
              <span className={totals.vitaminB2 > 0 ? "text-white" : "text-zinc-600"}>{totals.vitaminB2.toFixed(2)} mg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Niasin (eq):</span>
              <span className={totals.niacin > 0 ? "text-white" : "text-zinc-600"}>{totals.niacin.toFixed(1)} mg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vit. B6:</span>
              <span className={totals.vitaminB6 > 0 ? "text-white" : "text-zinc-600"}>{totals.vitaminB6.toFixed(2)} mg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Asam Pantotenat:</span>
              <span className={totals.pantothenicAcid > 0 ? "text-white" : "text-zinc-600"}>{totals.pantothenicAcid.toFixed(2)} mg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Asam Folat (eq):</span>
              <span className={totals.folate > 0 ? "text-white" : "text-zinc-600"}>{totals.folate.toFixed(0)} mcg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vit. B12:</span>
              <span className={totals.vitaminB12 > 0 ? "text-white" : "text-zinc-600"}>{totals.vitaminB12.toFixed(2)} mcg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vitamin C:</span>
              <span className={totals.vitaminC > 0 ? "text-white" : "text-zinc-600"}>{totals.vitaminC.toFixed(0)} mg</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Retinol (eq):</span>
              <span className={totals.retinol > 0 ? "text-white" : "text-zinc-600"}>{totals.retinol.toFixed(0)} mcg</span>
            </div>
          </div>
        </div>

        {/* Food Groups Breakdown */}
        <div className="space-y-2 border-t border-zinc-800/60 pt-3">
          <h4 className="text-[10px] text-[#00d4ff] font-bold font-mono uppercase tracking-wide flex items-center">
            <Database className="w-3 h-3 text-[#00d4ff] mr-1" />
            <span>Kelompok Makanan (g)</span>
          </h4>

          <div className="grid grid-cols-1 gap-1.5 pl-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Serealia & Umbi:</span>
              <span className={foodGroupsBreakdown.grains_roots > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.grains_roots.toFixed(0)} g</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Kacang-kacangan:</span>
              <span className={foodGroupsBreakdown.legumes > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.legumes.toFixed(0)} g</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Produk Susu:</span>
              <span className={foodGroupsBreakdown.dairy > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.dairy.toFixed(0)} g</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Daging/Ikan/Telur:</span>
              <span className={foodGroupsBreakdown.meat_fish_egg > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.meat_fish_egg.toFixed(0)} g</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px] leading-tight">
              <span>Sayur/Buah kaya Vit A:</span>
              <span className={foodGroupsBreakdown.vitA_rich > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.vitA_rich.toFixed(0)} g</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Buah/Sayur Lainnya:</span>
              <span className={foodGroupsBreakdown.other_veg_fruit > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.other_veg_fruit.toFixed(0)} g</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Minyak & Lemak:</span>
              <span className={foodGroupsBreakdown.oils_fats > 0 ? "text-white font-bold" : "text-zinc-600"}>{foodGroupsBreakdown.oils_fats.toFixed(0)} g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Warning & Diagnostic Boards */}
      <div className="mt-auto space-y-2">
        {clinicalWarnings.length > 0 ? (
          <div className="bg-red-950/15 border border-red-900/30 rounded p-3 space-y-1.5 animate-fade-in">
            <div className="flex items-center space-x-1.5 text-red-400 font-semibold text-[10px] font-mono uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Alarm Diagnosis Klinis</span>
            </div>
            <div className="space-y-1">
              {clinicalWarnings.map((warn, index) => (
                <p key={index} className="text-[10px] text-zinc-300 leading-tight">
                  • {warn}
                </p>
              ))}
            </div>
          </div>
        ) : logs.length > 0 ? (
          <div className="bg-emerald-950/15 border border-emerald-900/30 rounded p-3 flex items-start space-x-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-emerald-400 font-semibold text-[10px] font-mono uppercase tracking-wider block">
                Pola Makan Seimbang Terpenuhi
              </span>
              <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                Batas atas lemak jenuh atau natrium tidak terlampaui. Kebutuhan metabolisme seimbang.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded p-3 text-center text-[10px] text-zinc-500 font-mono">
            Awaiting food entry logs to run diagnostic rules.
          </div>
        )}
      </div>
    </div>
  );
}
