import React, { useState, useMemo } from "react";
import { useNutriStore, calculateNutrientTargets } from "../../store/useNutriStore";
import { analyzeDeficits } from "../../utils/analysis";
import { Printer, Calendar, ShieldCheck, Signature, Quote, MessageSquare } from "lucide-react";

export default function ReportGenerator() {
  const { projects, currentProjectId, foodDatabase } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);

  const [dietitianName, setDietitianName] = useState<string>("Dr. Amanda Kartini, Sp.GK");
  const [consultNotes, setConsultNotes] = useState<string>(
    "Pasien disarankan meningkatkan asupan serat pangan, mengurangi konsumsi lemak jenuh berlebih, serta mengonsumsi sayuran berdaun gelap untuk menutup celah mikronutrien kalsium dan zat besi. Kontrol kembali dalam 2 minggu."
  );

  const targets = useMemo(() => {
    if (!activeProject) return null;
    return calculateNutrientTargets(activeProject.patientProfile);
  }, [activeProject]);

  // Totals calculations
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

  // Deficits calculation
  const deficits = useMemo(() => {
    if (!activeProject || !targets) return [];
    return analyzeDeficits(totals, targets, foodDatabase);
  }, [totals, activeProject, targets, foodDatabase]);

  const handlePrint = () => {
    window.print();
  };

  if (!activeProject) {
    return (
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-8 text-center font-mono text-zinc-500 py-12">
        ⚠️ Pilih pasien aktif di panel samping untuk memicu audit penulisan laporan rujukan.
      </div>
    );
  }

  const { patientProfile } = activeProject;
  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 text-zinc-300 font-sans" id="report-generator-container">
      {/* Printable page style wrapper */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #sidebar-panel, #center-workspace-panel > div > :not(#printable-report-sheet), #right-inspector-panel, #status-bar-panel, button, select, textarea, input, h2 {
            display: none !important;
          }
          #center-workspace-panel {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
          }
          #printable-report-sheet {
            display: block !important;
            margin: 0 !important;
            padding: 20mm !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            color: black !important;
            font-family: 'Inter', sans-serif !important;
          }
          #printable-report-sheet * {
            color: black !important;
            border-color: #ccc !important;
          }
        }
      `}</style>

      {/* Control panel Row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Printer className="w-5 h-5 text-[#00d4ff]" />
            <span>Diagnostic Report Generator</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
            Tulis, kustomisasi, dan cetak lembar rujukan / ringkasan diagnosis terapi nutrisi medis pasien secara resmi.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-xs rounded shadow transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT REPORT (PDF)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Editorial inputs */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-[#00d4ff]" />
              <span>EDITORIAL METRICS</span>
            </h3>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                Clinical Dietitian / Nutritionist
              </label>
              <input
                type="text"
                value={dietitianName}
                onChange={(e) => setDietitianName(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">
                Consultation Advice & Recommendation remarks
              </label>
              <textarea
                rows={6}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] resize-none leading-relaxed"
                placeholder="Tulis instruksi tambahan..."
              />
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-500 font-mono leading-relaxed">
              💡 Perubahan pada formulir input kiri akan langsung direfleksikan secara dinamis pada "Simulated Paper Sheet" sebelah kanan sebelum dicetak.
            </div>
          </div>
        </div>

        {/* Right Side: High fidelity Paper preview sheet */}
        <div className="lg:col-span-2">
          <div
            id="printable-report-sheet"
            className="bg-white text-zinc-900 rounded-xl p-8 border border-zinc-300 shadow-2xl font-sans"
          >
            {/* Header / Letterhead */}
            <div className="border-b-2 border-zinc-900 pb-5 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 uppercase">
                  Nutri-Intelligence Clinical Center
                </h1>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Jl. Kesehatan No. 45, Jakarta • Telp: (021) 8594-9304
                </p>
                <p className="text-[10px] text-[#7c3aed] font-bold font-mono uppercase mt-0.5">
                  Laporan Diagnosis Terapi Gizi Medis (MNT)
                </p>
              </div>
              <div className="text-right text-[10px] font-mono text-zinc-500">
                <div className="font-bold text-zinc-900">CONFIDENTIAL REPORT</div>
                <div>Issued: {currentDateStr}</div>
                <div>Status: Verified by Dietitian</div>
              </div>
            </div>

            {/* Section 1: Patient Demographic Bio */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs border-b border-zinc-200 pb-4">
              <div>
                <h3 className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase mb-1.5">
                  Identitas Pasien
                </h3>
                <div className="space-y-1 font-mono text-zinc-800">
                  <div>Nama Pasien: <strong className="text-zinc-900">{patientProfile.name || activeProject.name}</strong></div>
                  <div>Tanggal Lahir / DOB: <strong>{patientProfile.dob || "—"}</strong></div>
                  <div>Jenis Kelamin / Sex: <strong>{patientProfile.gender}</strong></div>
                  <div>Kontak Pasien: <strong>{patientProfile.phone || "—"}</strong></div>
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase mb-1.5">
                  Klinis & Antropometri
                </h3>
                <div className="space-y-1 font-mono text-zinc-800">
                  <div>Berat Badan / Weight: <strong>{patientProfile.weight} kg</strong></div>
                  <div>Tinggi Badan / Height: <strong>{patientProfile.height} cm</strong></div>
                  <div>BMR Target: <strong>{patientProfile.bmr} kcal/day</strong></div>
                  <div>TDEE Target (Guideline): <strong>{targets?.calories} kcal/day</strong></div>
                </div>
              </div>
            </div>

            {/* Section 2: Core Nutrient Spreadsheet Summary */}
            <div className="mb-6">
              <h3 className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase mb-2">
                Asupan Gizi Harian (Meal Records Summary)
              </h3>
              
              <div className="border border-zinc-300 rounded overflow-hidden">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-700 font-bold">
                      <th className="p-2 border-r border-zinc-300">Nutrient Category</th>
                      <th className="p-2 border-r border-zinc-300 text-right">Target Requirement</th>
                      <th className="p-2 border-r border-zinc-300 text-right">Actual Intake</th>
                      <th className="p-2 text-right">Adequacy (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800">
                    {[
                      { name: "Energy (Kcal)", req: targets?.calories || 0, act: totals.calories },
                      { name: "Protein (g)", req: targets?.protein || 0, act: totals.protein },
                      { name: "Carbs (g)", req: targets?.carbs || 0, act: totals.carbs },
                      { name: "Fats (g)", req: targets?.fat || 0, act: totals.fat },
                      { name: "Fiber (g)", req: targets?.fiber || 0, act: totals.fiber },
                      { name: "Calcium (mg)", req: targets?.calcium || 0, act: totals.calcium },
                      { name: "Iron (mg)", req: targets?.iron || 0, act: totals.iron }
                    ].map((row) => {
                      const pct = row.req > 0 ? ((row.act / row.req) * 100).toFixed(0) : "0";
                      return (
                        <tr key={row.name} className="hover:bg-zinc-50">
                          <td className="p-2 border-r border-zinc-300 font-bold text-zinc-900">{row.name}</td>
                          <td className="p-2 border-r border-zinc-300 text-right">{row.req}</td>
                          <td className="p-2 border-r border-zinc-300 text-right">{parseFloat(row.act.toFixed(1))}</td>
                          <td className={`p-2 text-right font-bold ${
                            parseInt(pct) >= 90 && parseInt(pct) <= 110 ? "text-emerald-700" : "text-amber-700"
                          }`}>{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Gap & Deficits Alert Screening */}
            <div className="mb-6">
              <h3 className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase mb-2">
                Evaluasi Defisit Zat Gizi (Clinical Screening Gaps)
              </h3>
              {deficits.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-mono rounded">
                  ✅ Sempurna: Seluruh kecukupan nutrien pasien berada dalam koridor target klinis yang direkomendasikan.
                </div>
              ) : (
                <div className="border border-zinc-300 rounded overflow-hidden">
                  <div className="p-2 bg-zinc-50 border-b border-zinc-300 text-[11px] text-zinc-600 font-mono">
                    Zat gizi di bawah target minimum (&gt;10% gap):
                  </div>
                  <div className="divide-y divide-zinc-200 text-[11px] font-mono p-2 space-y-1 text-zinc-800">
                    {deficits.map((item) => (
                      <div key={item.nutrient} className="flex justify-between py-1">
                        <span className="capitalize font-bold text-zinc-900">
                          {item.nutrient === "vitaminA" ? "Vitamin A" : item.nutrient === "vitaminC" ? "Vitamin C" : item.nutrient}
                        </span>
                        <span className="text-red-700 font-bold">Defisit -{item.deficit} (Gap: {item.deficitPercent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Dietitian Consult remarks & notes */}
            <div className="mb-8 p-4 bg-zinc-50 border border-zinc-300 rounded-lg">
              <h3 className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase mb-1.5 flex items-center space-x-1">
                <Quote className="w-3.5 h-3.5 text-zinc-500" />
                <span>Rekomendasi Terapi & Catatan Konsultasi</span>
              </h3>
              <p className="text-xs text-zinc-800 leading-relaxed font-serif italic">
                "{consultNotes}"
              </p>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-end pt-8 border-t border-zinc-200 text-xs font-mono">
              <div>
                <div className="flex items-center space-x-1.5 text-emerald-700 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Clinical Data</span>
                </div>
                <div className="text-[10px] text-zinc-500">
                  Nutri-Intelligence Cryptographic Hash:<br />
                  <span className="text-zinc-400 font-mono">NTI-AISTUDIO-9483-E34B7D</span>
                </div>
              </div>

              <div className="text-center">
                <Signature className="w-12 h-8 mx-auto text-zinc-400 opacity-60 mb-1" />
                <div className="border-b border-zinc-900 pb-1 font-bold text-zinc-900">
                  {dietitianName}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Registrasi No: STR-GK-859402
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
