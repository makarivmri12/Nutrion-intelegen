import React, { useMemo } from "react";
import { useNutriStore, calculateNutrientTargets } from "../../store/useNutriStore";
import { analyzeDeficits, DeficitItem } from "../../utils/analysis";
import { AlertTriangle, Plus, CheckCircle, Info, Flame, ShieldAlert } from "lucide-react";

export default function DeficitAnalysis() {
  const { projects, currentProjectId, addFoodLogEntry, foodDatabase } = useNutriStore();

  const activeProject = projects.find((p) => p.id === currentProjectId);

  // Calculate current log totals
  const totals = useMemo(() => {
    const sum = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, iron: 0, sodium: 0, vitaminC: 0, vitaminA: 0 };
    if (!activeProject) return sum;

    activeProject.foodLogs.forEach((log) => {
      sum.calories += log.calories || 0;
      sum.protein += log.protein || 0;
      sum.carbs += log.carbs || 0;
      sum.fat += log.fat || 0;
      sum.fiber += log.fiber || 0;
      sum.calcium += log.calcium || 0;
      sum.iron += log.iron || 0;
      sum.sodium += log.sodium || 0;
      sum.vitaminC += log.vitaminC || 0;
      sum.vitaminA += log.vitaminA || 0;
    });
    return sum;
  }, [activeProject]);

  // Run the analysis engine
  const deficits = useMemo<DeficitItem[]>(() => {
    if (!activeProject) return [];
    const targets = calculateNutrientTargets(activeProject.patientProfile);
    return analyzeDeficits(totals, targets, foodDatabase);
  }, [totals, activeProject, foodDatabase]);

  // Handle adding a suggested food directly to spreadsheet logs
  const handleAddSuggestion = (foodId: string, amount: number) => {
    const foodItem = foodDatabase.find((f) => f.id === foodId);
    if (!foodItem) {
      alert("Error: Food item tidak ditemukan di database.");
      return;
    }

    addFoodLogEntry(foodItem, amount, "Deficit Suggestion");
    alert(`Berhasil menambahkan ${amount}g ${foodItem.name} ke Spreadsheet Pasien.`);
  };

  if (!activeProject) {
    return (
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-8 text-center font-mono text-zinc-500 py-12">
        ⚠️ Pilih pasien aktif di panel samping untuk memicu audit defisit nutrien.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 text-zinc-300 font-sans" id="deficit-analysis-container">
      {/* Header Banner */}
      <div className="mb-6 border-b border-[#27272a] pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <span className="text-amber-400">Clinical Deficit Analysis & Food Remedies</span>
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
          Pemindai selisih target gizi pasien dengan rekomendasi resep makanan penyeimbang secara presisi.
        </p>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase">Critical Deficits Detected</div>
          <div className="text-2xl font-mono font-bold text-amber-500 mt-1">
            {deficits.filter((d) => d.deficitPercent >= 30).length} <span className="text-xs text-zinc-500 font-normal">Nutrient(s)</span>
          </div>
        </div>
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4">
          <div className="text-[10px] text-zinc-500 font-mono uppercase">Mild/Moderate Deficits</div>
          <div className="text-2xl font-mono font-bold text-yellow-500 mt-1">
            {deficits.filter((d) => d.deficitPercent > 10 && d.deficitPercent < 30).length} <span className="text-xs text-zinc-500 font-normal">Nutrient(s)</span>
          </div>
        </div>
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase">Overall Fulfillment</div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
              {deficits.length === 0 ? "100% Meets Target" : `${7 - deficits.length} / 7 Safe`}
            </div>
          </div>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      {deficits.length === 0 ? (
        <div className="bg-[#121212] border border-emerald-900/40 rounded-xl p-8 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white font-mono">ALL CORE NUTRIENTS SATISFIED!</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Asupan makan harian pasien saat ini telah memenuhi sekurang-kurangnya 90% dari batas minimal yang dianjurkan dalam target klinis. Teruskan asupan seimbang ini.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {deficits.map((item) => {
            const isSevere = item.deficitPercent >= 30;
            const unit = item.nutrient === "calcium" ? "mg" : item.nutrient === "iron" ? "mg" : item.nutrient === "vitaminA" ? "mcg" : item.nutrient === "vitaminC" ? "mg" : "g";
            
            return (
              <div
                key={item.nutrient}
                className={`bg-[#121212] border rounded-xl overflow-hidden shadow-lg ${
                  isSevere ? "border-red-900/50" : "border-yellow-900/30"
                }`}
              >
                {/* Deficit Header row */}
                <div className="p-4 bg-[#1a1a1b] flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a]">
                  <div className="flex items-center space-x-3">
                    {isSevere ? (
                      <div className="p-1.5 bg-red-500/10 text-red-400 rounded">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-bold text-white capitalize font-mono tracking-wide">
                        {item.nutrient === "vitaminA" ? "Vitamin A" : item.nutrient === "vitaminC" ? "Vitamin C" : item.nutrient}
                      </span>
                      <span className={`ml-2 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        isSevere ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {isSevere ? "Defisit Parah" : "Defisit Ringan"} ({item.deficitPercent}% Gap)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-zinc-400 text-right">
                    <span>Target: <strong>{item.recommended} {unit}</strong></span>
                    <span className="mx-2">•</span>
                    <span>Intake: <strong className="text-zinc-200">{item.current} {unit}</strong></span>
                    <span className="mx-2">•</span>
                    <span className="text-red-400">Gap: <strong>-{item.deficit} {unit}</strong></span>
                  </div>
                </div>

                {/* Suggestions Cards section */}
                <div className="p-4 space-y-3">
                  <h4 className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-bold flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>DIETARY REMEDY: SUGGESTED FOOD RECONCILIATIONS</span>
                  </h4>

                  {item.suggestedFoods.length === 0 ? (
                    <p className="text-xs text-zinc-500 font-mono">
                      Tidak ada opsi spesifik yang ditemukan di database untuk mengatasi kekurangan zat ini.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {item.suggestedFoods.map((sug) => (
                        <div
                          key={sug.foodId}
                          className="bg-[#18181b] border border-zinc-800 rounded-lg p-3 flex flex-col justify-between hover:border-zinc-700 transition-colors"
                        >
                          <div>
                            <div className="text-xs font-semibold text-white truncate" title={sug.name}>
                              {sug.name}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1 space-y-0.5">
                              <div>Remedy Dose: <strong className="text-[#00d4ff]">{sug.amount}g</strong></div>
                              <div>Provides: <strong className="text-emerald-400">+{sug.nutrientProvided} {unit}</strong></div>
                              <div>Energy load: <strong className="text-zinc-400">{sug.calories} kcal</strong></div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddSuggestion(sug.foodId, sug.amount)}
                            className="w-full mt-3 py-1 bg-zinc-800 hover:bg-[#00d4ff]/20 hover:text-[#00d4ff] text-[10px] font-mono rounded text-zinc-300 font-medium flex items-center justify-center space-x-1 border border-zinc-700 transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Logs</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg flex items-start space-x-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-zinc-400 font-mono">
              <strong className="text-white">Alur Rekomendasi Klinik:</strong> Formula penghitungan remedy mengidentifikasi bahan makanan dengan kandungan tertinggi pada nutrien yang defisit di database, lalu memproyeksikan rasio berat (gram) yang dibutuhkan untuk menutup celah tersebut secara matematis. Anda dapat memasukkan makanan ini langsung ke spreadsheet pasien untuk memperbarui evaluasi secara dinamis.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
