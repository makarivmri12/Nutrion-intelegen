import React, { useState, useEffect } from "react";
import { useNutriStore, calculateNutrientTargets } from "../store/useNutriStore";
import { 
  Sparkles, 
  Brain, 
  RefreshCw, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle,
  Lightbulb,
  Heart
} from "lucide-react";

function parseInlineMarkdown(text: string): React.ReactNode {
  // Replace double asterisks with strong tags, and single asterisks with em tags.
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={index} className="italic text-zinc-200">{part.slice(1, -1)}</em>;
        } else {
          return <span key={index}>{part}</span>;
        }
      })}
    </>
  );
}

export default function AIIntelligenceTab() {
  const { projects, currentProjectId } = useNutriStore();
  const activeProject = projects.find((p) => p.id === currentProjectId);

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingPhrases = [
    "Menganalisis profil fisiologis pasien...",
    "Mengkalkulasi defisit/surplus mikronutrisi harian...",
    "Menilai korelasi tekanan darah & kadar asupan natrium...",
    "Merumuskan alternatif substitusi makanan nabati/sehat...",
    "Menyusun rancangan menu kustomisasi 1 hari...",
    "Menghasilkan dokumen laporan klinis akhir via Gemini AI..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingPhrases.length - 1 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
        Select a patient file to enable AI-powered nutrition intelligence diagnostics.
      </div>
    );
  }

  const logs = activeProject.foodLogs;
  const profile = activeProject.patientProfile;
  const targets = calculateNutrientTargets(profile);

  // Calculate dynamic logs total
  const totals = logs.reduce((acc, log) => {
    acc.calories += log.calories;
    acc.protein += log.protein;
    acc.carbs += log.carbs;
    acc.fat += log.fat;
    acc.sodium += log.sodium;
    acc.fiber += log.fiber;
    acc.iron += log.iron;
    acc.calcium += log.calcium;
    acc.vitaminC += log.vitaminC;
    return acc;
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sodium: 0,
    fiber: 0,
    iron: 0,
    calcium: 0,
    vitaminC: 0
  });

  const handleGenerateReport = async (customPromptModifier?: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setReport("");
    
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfile: {
            ...profile,
            notes: customPromptModifier 
              ? `${profile.notes || ""}. PEMFOKUSAN REPORT: ${customPromptModifier}`
              : profile.notes
          },
          foodLogs: logs.map(l => ({ name: l.name, category: l.category, weightGrams: l.weightGrams, calories: l.calories, protein: l.protein, carbs: l.carbs, fat: l.fat })),
          totals,
          targets
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to contact Gemini server model.");
      }

      setReport(data.report || "No response received.");
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Error contacting intelligence model.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      console.warn("Clipboard API is not available or blocked in this environment.");
      // Fallback: alert or simple UI change
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    navigator.clipboard.writeText(report)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.warn("Clipboard write failed or blocked:", err);
      });
  };

  const handleDownloadReportFile = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Clinical_Report_${profile.name.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a]" id="ai-intelligence-container">
      {/* Top Controls Header */}
      <div className="p-4 bg-[#121212] border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-pink-500 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
            Clinical AI Nutrition Diagnostics
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {report && (
            <>
              <button
                onClick={copyToClipboard}
                className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono rounded text-zinc-300 font-medium flex items-center space-x-1.5 transition-colors border border-zinc-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Report"}</span>
              </button>

              <button
                onClick={handleDownloadReportFile}
                className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono rounded text-zinc-300 font-medium flex items-center space-x-1.5 transition-colors border border-zinc-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .MD File</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleGenerateReport()}
            disabled={isLoading || logs.length === 0}
            className="py-1.5 px-4 bg-gradient-to-r from-pink-500 to-[#7c3aed] text-white disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 font-semibold text-xs rounded flex items-center space-x-1.5 transition-all shadow-lg hover:shadow-pink-500/10 cursor-pointer"
            id="trigger-ai-report-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{report ? "Re-Generate Report" : "Generate AI Diagnosis"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          /* Loading Overlay Step-by-Step Simulator */
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 animate-fade-in">
            <div className="p-4 rounded-full bg-gradient-to-tr from-pink-500/10 to-purple-500/10 text-pink-500 animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white tracking-wider font-mono">
                GENERATING CLINICAL ANALYSIS
              </h4>
              <p className="text-xs text-zinc-400 h-8 font-sans transition-all">
                {loadingPhrases[loadingStep]}
              </p>
            </div>
            {/* Simulation bar */}
            <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-[#7c3aed] transition-all duration-300"
                style={{ width: `${((loadingStep + 1) / loadingPhrases.length) * 100}%` }}
              />
            </div>
          </div>
        ) : errorMessage ? (
          /* Error Boundary screen */
          <div className="max-w-md mx-auto mt-12 bg-red-950/20 border border-red-900/40 rounded-lg p-5 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Analysis Failed</h3>
            <p className="text-xs text-red-400 leading-relaxed font-mono">
              {errorMessage}
            </p>
            <button
              onClick={() => handleGenerateReport()}
              className="py-1.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded font-medium"
            >
              Retry Connection
            </button>
          </div>
        ) : report ? (
          /* High-Fidelity rendered markdown report */
          <div className="max-w-3xl mx-auto bg-[#121212] border border-[#27272a] rounded-lg p-6 md:p-8 shadow-xl">
            {/* Custom Heading badge */}
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-4 mb-6">
              <div className="px-2 py-1 rounded bg-pink-500/10 text-pink-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                Clinical Diagnosis Document
              </div>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">Verified by Gemini 3.5 Flash</span>
            </div>

            {/* Custom stylized markdown content renderer */}
            <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-4 leading-relaxed font-sans">
              {report.split("\n").map((line, idx) => {
                // Header 1
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={idx} className="text-lg font-bold text-white tracking-wide font-mono mt-6 mb-2 border-b border-zinc-800 pb-2">
                      {parseInlineMarkdown(line.replace("# ", ""))}
                    </h1>
                  );
                }
                // Header 2
                if (line.startsWith("## ")) {
                  return (
                    <h2 key={idx} className="text-sm font-bold text-[#00d4ff] tracking-wide font-mono mt-5 mb-2 flex items-center space-x-2">
                      <span>•</span>
                      <span>{parseInlineMarkdown(line.replace("## ", ""))}</span>
                    </h2>
                  );
                }
                // Header 3
                if (line.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="text-xs font-semibold text-purple-400 mt-4 mb-1">
                      {parseInlineMarkdown(line.replace("### ", ""))}
                    </h3>
                  );
                }
                // Bullet points
                if (line.startsWith("- ") || line.startsWith("* ")) {
                  return (
                    <div key={idx} className="pl-4 flex items-start space-x-2 my-1 text-[11.5px]">
                      <span className="text-zinc-500 mt-1">•</span>
                      <span>{parseInlineMarkdown(line.substring(2))}</span>
                    </div>
                  );
                }
                // Blockquotes
                if (line.startsWith("> ")) {
                  return (
                    <blockquote key={idx} className="border-l-2 border-[#7c3aed] bg-purple-950/10 p-3 rounded text-[11.5px] italic text-zinc-400 my-3 leading-relaxed">
                      {parseInlineMarkdown(line.replace("> ", ""))}
                    </blockquote>
                  );
                }
                // Empty lines
                if (!line.trim()) {
                  return <div key={idx} className="h-2" />;
                }
                // Standard text
                return <p key={idx} className="leading-relaxed text-[11.5px] text-zinc-300">{parseInlineMarkdown(line)}</p>;
              })}
            </div>
          </div>
        ) : (
          /* Empty placeholder / prompt assistant suggestions panel */
          <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
            <div className="p-4 rounded-full bg-[#121212] text-pink-500 mx-auto w-16">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Clinical Dietitian Diagnostic AI Assistant
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                Kirim data log nutrisi harian dan profil medis pasien ke Gemini AI. Sistem akan melakukan diagnosis defisiensi, memetakan risiko klinis, dan menyusun menu harian ideal secara instan.
              </p>
            </div>

            {logs.length === 0 ? (
              <div className="bg-amber-950/10 border border-amber-900/30 text-amber-400 text-xs p-3 rounded-md inline-block">
                ⚠️ Harap isi data log makanan di tab <strong>Nutrient Spreadsheet</strong> terlebih dahulu sebelum melakukan diagnosis AI.
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Quick Focus Prompts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                  <button
                    onClick={() => handleGenerateReport("Fokuskan peninjauan pada asupan kalori & manajemen berat badan")}
                    className="p-3 bg-[#121212] hover:bg-[#1a1a1a] border border-zinc-800 rounded text-left text-xs text-zinc-300 hover:text-white transition-all flex items-start space-x-2"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[11px] block text-white">Weight & Calories</span>
                      Optimalkan asupan makronutrisi harian berdasarkan total TDEE.
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateReport("Fokuskan peninjauan pada asupan garam (sodium) & manajemen tekanan darah tinggi")}
                    className="p-3 bg-[#121212] hover:bg-[#1a1a1a] border border-zinc-800 rounded text-left text-xs text-zinc-300 hover:text-white transition-all flex items-start space-x-2"
                  >
                    <Heart className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[11px] block text-white">Cardiovascular / Hypertension</span>
                      Evaluasi asupan natrium tinggi dan resiko klinis hipertensi.
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateReport("Fokuskan peninjauan pada kandungan serat harian & kesehatan usus / pencernaan")}
                    className="p-3 bg-[#121212] hover:bg-[#1a1a1a] border border-zinc-800 rounded text-left text-xs text-zinc-300 hover:text-white transition-all flex items-start space-x-2"
                  >
                    <FileText className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[11px] block text-white">Digestive & Fiber Target</span>
                      Pastikan asupan serat pangan mencapai kuota harian ideal.
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateReport("Fokuskan peninjauan pada alternatif substitusi makanan vegan bebas kolesterol")}
                    className="p-3 bg-[#121212] hover:bg-[#1a1a1a] border border-zinc-800 rounded text-left text-xs text-zinc-300 hover:text-white transition-all flex items-start space-x-2"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[11px] block text-white">Plant-Based Replacements</span>
                      Konversikan asupan hewani ke alternatif nabati kaya protein.
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
