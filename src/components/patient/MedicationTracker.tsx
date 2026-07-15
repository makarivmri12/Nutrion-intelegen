import React, { useState, useEffect, useRef } from 'react';
import { useNutriStore } from '../../store/useNutriStore';
import { drugNutrientInteractions, DrugNutrientInteraction } from '../../data/drug-nutrient-interactions';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Clock, 
  Search, 
  BookOpen, 
  Printer, 
  Sparkles,
  Heart,
  ChevronDown,
  Info,
  X,
  Keyboard
} from 'lucide-react';

interface DietInteraction {
  medication: string;
  nutrient: string;
  foodName: string;
  severity: 'mild' | 'moderate' | 'severe';
  mechanism: string;
  recommendation: string;
  timingAdvice: string;
}

const COMMON_SUPPLEMENTS = [
  { name: 'Kalsium', drugName: 'Kalsium (Susu)', class: 'Suplemen Mineral' },
  { name: 'Zat Besi', drugName: 'Zat Besi (Fe)', class: 'Suplemen Mineral' },
  { name: 'Vitamin B12', drugName: 'Vitamin B12', class: 'Suplemen Vitamin' },
  { name: 'Asam Folat', drugName: 'Asam Folat (Vitamin B9)', class: 'Suplemen Vitamin' },
  { name: 'Coenzyme Q10', drugName: 'Coenzyme Q10 (CoQ10)', class: 'Suplemen Enzim' },
  { name: 'Magnesium', drugName: 'Magnesium', class: 'Suplemen Mineral' },
  { name: 'Vitamin D', drugName: 'Vitamin D', class: 'Suplemen Vitamin' }
];

export default function MedicationTracker() {
  const { currentProjectId, projects, updatePatientProfile } = useNutriStore();
  const activeProject = projects.find(p => p.id === currentProjectId);
  const patientProfile = activeProject?.patientProfile;

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Focus search input on Ctrl+I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!patientProfile) {
    return (
      <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 text-center text-zinc-500 text-xs font-mono">
        [ERROR] Data profil pasien kosong. Harap buat proyek baru atau pilih pasien aktif.
      </div>
    );
  }

  // Get active medications and supplements from profile
  const activeMedications = patientProfile.medications || [];

  // Match active medications in clinical database
  const activeInteractions = drugNutrientInteractions.filter(item => 
    activeMedications.some(med => 
      med.toLowerCase() === item.drugName.toLowerCase() ||
      item.drugName.toLowerCase().includes(med.toLowerCase()) ||
      med.toLowerCase().includes(item.drugName.toLowerCase())
    )
  );

  // Auto-detect interaksi dengan diet aktif (foodLogs)
  const activeDietInteractions: DietInteraction[] = [];

  if (activeProject && activeProject.foodLogs) {
    activeMedications.forEach((medName) => {
      const masterInts = drugNutrientInteractions.filter(item => 
        item.drugName.toLowerCase() === medName.toLowerCase() ||
        item.drugName.toLowerCase().includes(medName.toLowerCase()) ||
        medName.toLowerCase().includes(item.drugName.toLowerCase())
      );

      masterInts.forEach((item) => {
        const nutrientLower = item.nutrient.toLowerCase();
        
        activeProject.foodLogs.forEach((log) => {
          const logNameLower = log.name.toLowerCase();
          let triggerFound = false;
          let triggerReason = "";

          if (nutrientLower.includes("vitamin k")) {
            const greenKeywords = ["bayam", "kangkung", "brokoli", "sawi", "daun", "sayur", "selada", "salad", "kale", "paku", "kelor", "hijau"];
            if (greenKeywords.some(kw => logNameLower.includes(kw))) {
              triggerFound = true;
              triggerReason = "Sayuran hijau tinggi Vitamin K";
            }
          } 
          else if (nutrientLower.includes("kalsium") || nutrientLower.includes("calcium")) {
            const calciumKeywords = ["susu", "milk", "keju", "cheese", "yogurt", "yoghurt", "dancow", "kalsium", "calcium", "yoyic", "ultramilk"];
            if (calciumKeywords.some(kw => logNameLower.includes(kw)) || (log.calcium && log.calcium > 50)) {
              triggerFound = true;
              triggerReason = `Makanan kaya Kalsium (${log.calcium || 50}+ mg)`;
            }
          }
          else if (nutrientLower.includes("zat besi") || nutrientLower.includes("besi") || nutrientLower.includes("iron")) {
            const ironKeywords = ["hati", "sapi", "kambing", "daging", "bayam", "sangobion", "besi", "iron"];
            if (ironKeywords.some(kw => logNameLower.includes(kw)) || (log.iron && log.iron > 2)) {
              triggerFound = true;
              triggerReason = `Makanan kaya Zat Besi (${log.iron || 2}+ mg)`;
            }
          }
          else if (nutrientLower.includes("magnesium")) {
            const mgKeywords = ["antasida", "promag", "almond", "biji labu", "pumpkin", "magnesium"];
            if (mgKeywords.some(kw => logNameLower.includes(kw)) || (log.magnesium && log.magnesium > 30)) {
              triggerFound = true;
              triggerReason = `Makanan kaya Magnesium (${log.magnesium || 30}+ mg)`;
            }
          }
          else if (nutrientLower.includes("kafein") || nutrientLower.includes("caffeine")) {
            const caffeineKeywords = ["kopi", "coffee", "teh", "tea", "coklat", "cokelat", "chocolate", "caffeine", "kafein", "matcha", "boba"];
            if (caffeineKeywords.some(kw => logNameLower.includes(kw))) {
              triggerFound = true;
              triggerReason = "Minuman/makanan mengandung Kafein";
            }
          }
          else if (nutrientLower.includes("tiramin") || nutrientLower.includes("tyramine")) {
            const tyramineKeywords = ["tape", "tapai", "tempe", "tauco", "terasi", "keju", "cheese", "fermentasi"];
            if (tyramineKeywords.some(kw => logNameLower.includes(kw))) {
              triggerFound = true;
              triggerReason = "Olahan fermentasi mengandung Tiramin";
            }
          }
          else if (nutrientLower.includes("protein")) {
            const proteinKeywords = ["daging", "sapi", "ayam", "telur", "egg", "ikan", "fish", "udang", "seafood"];
            if (proteinKeywords.some(kw => logNameLower.includes(kw)) || (log.protein && log.protein > 15)) {
              triggerFound = true;
              triggerReason = `Makanan berprotein tinggi (${log.protein || 15}+ g)`;
            }
          }
          else if (nutrientLower.includes("lemak") || nutrientLower.includes("fat")) {
            const fatKeywords = ["goreng", "minyak", "mentega", "butter", "santan", "gajih", "lemak"];
            if (fatKeywords.some(kw => logNameLower.includes(kw)) || (log.fat && log.fat > 15)) {
              triggerFound = true;
              triggerReason = `Makanan berlemak tinggi (${log.fat || 15}+ g)`;
            }
          }
          else if (nutrientLower.includes("grapefruit") || nutrientLower.includes("jeruk")) {
            const gfKeywords = ["grapefruit", "jeruk bali", "jeruk purut", "limau", "citrus"];
            if (gfKeywords.some(kw => logNameLower.includes(kw))) {
              triggerFound = true;
              triggerReason = "Jeruk golongan Grapefruit/Citrus";
            }
          }

          if (triggerFound) {
            const duplicate = activeDietInteractions.some(d => d.medication === medName && d.foodName === log.name && d.nutrient === item.nutrient);
            if (!duplicate) {
              activeDietInteractions.push({
                medication: medName,
                nutrient: item.nutrient,
                foodName: log.name,
                severity: item.severity,
                mechanism: item.mechanism,
                recommendation: item.recommendation,
                timingAdvice: item.timingAdvice
              });
            }
          }
        });
      });
    });
  }

  // Filter available suggestions from master drug list
  const filteredSuggestions = drugNutrientInteractions.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesName = item.drugName.toLowerCase().includes(q);
    const matchesClass = item.drugClass.toLowerCase().includes(q);
    const isAlreadyAdded = activeMedications.some(m => m.toLowerCase() === item.drugName.toLowerCase());
    return q && (matchesName || matchesClass) && !isAlreadyAdded;
  });

  // Unique suggestions based on drug name to avoid redundancy in dropdown
  const uniqueSuggestions: DrugNutrientInteraction[] = [];
  const mapName = new Set();
  filteredSuggestions.forEach(item => {
    if (!mapName.has(item.drugName.toLowerCase())) {
      mapName.add(item.drugName.toLowerCase());
      uniqueSuggestions.push(item);
    }
  });

  // Group interactions by severity for indicators
  const allScreened = [...activeInteractions];
  const highSeverity = allScreened.filter(i => i.severity === 'severe');
  const moderateSeverity = allScreened.filter(i => i.severity === 'moderate');
  const lowSeverity = allScreened.filter(i => i.severity === 'mild');

  const handleAddMedication = (drugName: string) => {
    if (!drugName.trim()) return;
    const isAdded = activeMedications.some(m => m.toLowerCase() === drugName.toLowerCase());
    if (!isAdded) {
      const updated = [...activeMedications, drugName.trim()];
      updatePatientProfile({ medications: updated });
    }
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleRemoveMedication = (drugName: string) => {
    const updated = activeMedications.filter(m => m.toLowerCase() !== drugName.toLowerCase());
    updatePatientProfile({ medications: updated });
  };

  const toggleSupplement = (suppName: string) => {
    const isAdded = activeMedications.some(m => m.toLowerCase() === suppName.toLowerCase());
    if (isAdded) {
      handleRemoveMedication(suppName);
    } else {
      handleAddMedication(suppName);
    }
  };

  // Keyboard Navigation for Autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < uniqueSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : uniqueSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < uniqueSuggestions.length) {
        handleAddMedication(uniqueSuggestions[highlightedIndex].drugName);
      } else {
        handleAddMedication(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Scroll active highlighted autocomplete item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const activeEl = suggestionsRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const triggerPrint = () => {
    window.print();
  };

  return (
    <>
      {/* Dynamic print-only style block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: transparent !important;
            color: #000000 !important;
          }
          #print-report-area, #print-report-area * {
            visibility: visible;
          }
          #print-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
            color: black !important;
          }
          #print-report-area button, #print-report-area .no-print {
            display: none !important;
          }
          .print-border-black {
            border: 1px solid #000000 !important;
          }
        }
      `}</style>

      {/* RENDER NORMAL VIEW */}
      {!isPrintPreview ? (
        <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden text-zinc-300" id="medication-tracker-card">
          {/* Header */}
          <div className="p-5 border-b border-[#27272a] bg-[#161618] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide font-mono uppercase flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#00d4ff]" />
                Drug-Nutrient Interactions & Medication Tracker
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                Skrining otomatis risiko interaksi obat harian dengan zat gizi mikro/makro dan log diet pasien.
              </p>
            </div>
            
            <button
              onClick={() => setIsPrintPreview(true)}
              className="px-3 py-1.5 bg-[#1f1f23] hover:bg-[#2a2a30] text-zinc-200 border border-[#3f3f46] text-xs font-mono rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              title="Cetak analisis interaksi untuk resep klinis"
            >
              <Printer className="w-3.5 h-3.5 text-[#00d4ff]" />
              Cetak Laporan
            </button>
          </div>

          {/* Quick Info Alerts */}
          {showQuickTips && (
            <div className="mx-5 mt-4 p-3.5 bg-cyan-950/20 border border-cyan-800/30 rounded text-[11px] flex items-start gap-2.5 text-cyan-200 relative">
              <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-mono font-bold uppercase text-[#00d4ff] tracking-wider block">Fitur Pintar Terpasang:</span>
                <p className="leading-relaxed">
                  Z-Score otomatis beroperasi di latar belakang. Ketik obat / suplemen di bawah (misal: <strong>Metformin</strong>, <strong>Warfarin</strong>, atau <strong>Omeprazole</strong>) untuk menyaring interaksi secara real-time. Tekan <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-white border border-zinc-700 font-mono text-[9px]">Ctrl+I</kbd> kapan saja untuk fokus pencarian.
                </p>
              </div>
              <button 
                onClick={() => setShowQuickTips(false)} 
                className="absolute top-2.5 right-2.5 text-cyan-400/60 hover:text-cyan-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form & Add */}
            <div className="lg:col-span-1 space-y-5">
              
              {/* Autocomplete Search input */}
              <div className="space-y-2 relative">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Masukkan Obat / Suplemen Pasien:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Ketik nama obat (misal: Ciprofloxacin)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      setHighlightedIndex(-1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]/30 font-sans"
                    id="drug-search-input"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                      className="absolute right-2.5 top-2.5 p-0.5 text-zinc-500 hover:text-white rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Autocomplete suggestion dropdown */}
                {showSuggestions && searchQuery && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-30 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-[#18181b] border border-[#27272a] rounded shadow-xl divide-y divide-zinc-800"
                  >
                    {uniqueSuggestions.length > 0 ? (
                      uniqueSuggestions.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => handleAddMedication(item.drugName)}
                          className={`px-3 py-2 text-left text-xs transition-colors cursor-pointer flex justify-between items-center ${
                            idx === highlightedIndex ? 'bg-[#00d4ff]/10 text-white' : 'hover:bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-white block">{item.drugName}</span>
                            <span className="text-[10px] text-zinc-500">{item.drugClass}</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded uppercase">
                            {item.severity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-[10px] text-zinc-500 font-mono">
                        Belum ada dalam database klinis.
                        <button
                          onClick={() => handleAddMedication(searchQuery)}
                          className="mt-1.5 block w-full py-1 bg-[#00d4ff]/10 border border-dashed border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 text-[#00d4ff] font-bold rounded transition-colors text-[9px] uppercase tracking-wider"
                        >
                          + Tambah Kustom "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick-toggles for common Indonesian supplements */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#00d4ff]" />
                  Suplemen Gizi Umum Pasien:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SUPPLEMENTS.map(supp => {
                    const isSelected = activeMedications.some(m => m.toLowerCase() === supp.drugName.toLowerCase());
                    return (
                      <button
                        key={supp.name}
                        onClick={() => toggleSupplement(supp.drugName)}
                        className={`px-2 py-1 text-[10px] font-mono rounded border transition-all cursor-pointer active:scale-[0.97] ${
                          isSelected 
                            ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/40 font-bold' 
                            : 'bg-[#18181b] text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {supp.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active list */}
              <div className="pt-2">
                <h3 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Daftar Regimen Aktif:</span>
                  <span className="text-zinc-500 font-normal">({activeMedications.length})</span>
                </h3>

                {activeMedications.length > 0 ? (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {activeMedications.map((med, index) => {
                      const hasInt = drugNutrientInteractions.some(i => i.drugName.toLowerCase() === med.toLowerCase());
                      return (
                        <div 
                          key={index} 
                          className="p-2.5 bg-[#18181b] border border-[#27272a] rounded flex items-center justify-between hover:border-zinc-700 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${hasInt ? 'bg-amber-950 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                              <Pill className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="text-xs text-zinc-200 capitalize font-medium">{med}</span>
                              <span className="block text-[8px] text-zinc-500">
                                {hasInt ? '⚠️ Terdeteksi interaksi klinis' : 'Aman'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMedication(med)}
                            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded transition-colors"
                            title="Hapus dari daftar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-zinc-800 rounded bg-[#151518]/30 text-center text-zinc-500 text-[11px] font-sans italic">
                    Belum ada obat atau suplemen aktif. Tambah di atas atau pilih dari suplemen umum.
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Interaction Alerts */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Main Summary Panel */}
              {allScreened.length > 0 || activeDietInteractions.length > 0 ? (
                <div className={`p-4 rounded border flex items-start gap-3.5 ${
                  highSeverity.length > 0 || activeDietInteractions.some(d => d.severity === 'severe')
                    ? 'bg-red-950/20 border-red-900/30 text-red-200' 
                    : 'bg-amber-950/20 border-amber-900/30 text-amber-200'
                }`}>
                  <div className={`p-2 rounded mt-0.5 shrink-0 ${
                    highSeverity.length > 0 || activeDietInteractions.some(d => d.severity === 'severe')
                      ? 'bg-red-800 text-white' 
                      : 'bg-amber-700 text-white'
                  }`}>
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                      Hasil Skrining Interaksi Pasien
                    </h4>
                    <p className="text-[11px] leading-relaxed text-zinc-300">
                      Ditemukan <strong className="text-white">{activeInteractions.length} interaksi klinis</strong> dalam resep rekam medis dan <strong className="text-[#00d4ff] font-bold">{activeDietInteractions.length} bentrokan gizi aktif</strong> dengan log makanan spreadsheet harian pasien.
                    </p>
                    <div className="flex gap-2.5 pt-1 text-[9px] font-mono font-bold">
                      <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded">
                        🔴 SEVERE: {highSeverity.length + activeDietInteractions.filter(d => d.severity === 'severe').length}
                      </span>
                      <span className="bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded">
                        🟡 MODERATE: {moderateSeverity.length + activeDietInteractions.filter(d => d.severity === 'moderate').length}
                      </span>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded">
                        🟢 MILD: {lowSeverity.length + activeDietInteractions.filter(d => d.severity === 'mild').length}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-emerald-900/30 rounded bg-emerald-950/10 text-emerald-200 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Skrining Interaksi Aman</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Sistem tidak mendeteksi bentrokan obat-zat gizi berbahaya pada resep aktif ini. Pasien dapat melanjutkan diet terpadu tanpa penyesuaian khusus.
                    </p>
                  </div>
                </div>
              )}

              {/* Real-time Diet Logs interactions */}
              {activeDietInteractions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-[#00d4ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                    Deteksi Tabrakan Gizi dalam Diet Harian (Spreadsheet Log Makanan)
                  </h3>

                  <div className="space-y-2">
                    {activeDietInteractions.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 bg-[#16161a] border border-[#27272a] rounded relative overflow-hidden flex items-start gap-3 border-l-2 ${
                          item.severity === 'severe' ? 'border-l-red-500' :
                          item.severity === 'moderate' ? 'border-l-amber-500' :
                          'border-l-blue-400'
                        }`}
                      >
                        <div className={`p-1 rounded shrink-0 ${
                          item.severity === 'severe' ? 'bg-red-950 text-red-400' :
                          item.severity === 'moderate' ? 'bg-amber-950 text-amber-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-white uppercase font-mono">
                              {item.medication} ⇄ {item.nutrient}
                            </span>
                            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-sm uppercase ${
                              item.severity === 'severe' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                              item.severity === 'moderate' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {item.severity}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            ⚠️ Pasien mencatat konsumsi <strong className="text-[#00d4ff]">{item.foodName}</strong> dalam spreadsheet log makanan, yang merupakan sumber utama <strong className="text-white">{item.nutrient}</strong>.
                          </p>

                          <div className="p-2 bg-[#1a1a1e] rounded text-[10px] text-zinc-400 leading-relaxed border border-zinc-800/60">
                            <strong className="text-zinc-300 block font-mono text-[9px] uppercase tracking-wider mb-0.5">Mekanisme Klinis:</strong>
                            {item.mechanism}
                          </div>

                          <div className="p-2 bg-[#1f2937]/20 rounded text-[10px] text-cyan-200/90 leading-relaxed border border-cyan-900/20">
                            <strong className="text-cyan-300 block font-mono text-[9px] uppercase tracking-wider mb-0.5">Solusi Nutrisionis:</strong>
                            {item.recommendation}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                            <Clock className="w-3 h-3 text-[#00d4ff]" />
                            <span>Protokol Pemberian: {item.timingAdvice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Clinical interactions details */}
              {activeInteractions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#00d4ff]" />
                    Analisis Farmakologi Gizi Klinis (Mekanisme & Rekomendasi)
                  </h3>

                  <div className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
                    {activeInteractions.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3.5 bg-[#161618] border border-[#27272a] rounded relative overflow-hidden flex flex-col gap-2.5 border-l-2 ${
                          item.severity === 'severe' ? 'border-l-red-500' :
                          item.severity === 'moderate' ? 'border-l-amber-500' :
                          'border-l-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white uppercase font-mono">{item.drugName}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">({item.drugClass})</span>
                            </div>
                            <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">
                              Bentrokan Zat Gizi: <strong className="text-white">{item.nutrient}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-300 uppercase">
                              Level {item.evidenceLevel}
                            </span>
                            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-sm uppercase ${
                              item.severity === 'severe' ? 'bg-red-950 text-red-400' :
                              item.severity === 'moderate' ? 'bg-amber-950 text-amber-400' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>
                              {item.severity}
                            </span>
                          </div>
                        </div>

                        {/* Mechanism & Solution */}
                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <div className="p-2 bg-[#1b1b1f] rounded border border-zinc-800/60">
                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Mekanisme:</span>
                            {item.mechanism}
                          </div>

                          <div className="p-2 bg-[#121f24] rounded border border-cyan-950/40 text-cyan-200">
                            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">Intervensi Gizi & Rekomendasi:</span>
                            {item.recommendation}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                            <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            <span>Protokol Pemberian: <strong>{item.timingAdvice}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        /* PRINT PREVIEW LAYOUT MODE */
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 space-y-6 text-zinc-300">
          {/* Controls - No print */}
          <div className="no-print bg-[#1a1a1d] border border-zinc-800 rounded p-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs font-mono font-semibold text-white uppercase">MODE PREVIEW CETAK LAPORAN INTERAKSI</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPrintPreview(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono rounded cursor-pointer transition-all"
              >
                Kembali
              </button>
              <button
                onClick={triggerPrint}
                className="px-3 py-1 bg-[#00d4ff] hover:bg-[#00b2d6] text-black font-bold text-xs font-mono rounded cursor-pointer transition-all shadow flex items-center gap-1"
              >
                <Printer className="w-3 h-3" />
                Cetak Dokumen
              </button>
            </div>
          </div>

          {/* Printable Area Wrapper */}
          <div id="print-report-area" className="bg-white text-black p-8 rounded shadow-lg print-border-black font-sans">
            
            {/* Report Header */}
            <div className="border-b-2 border-black pb-4 mb-5 flex justify-between items-start">
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase font-mono">
                  LAPORAN FARMAKOLOGI INTERAKSI OBAT-ZAT GIZI
                </h1>
                <p className="text-xs text-zinc-600 mt-1 font-mono">
                  Nutri-Intelligence Clinical Assessment Platform • Rujukan Gizi Indonesia
                </p>
              </div>
              <div className="text-right text-xs font-mono text-zinc-500">
                Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Patient Info Table */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-50 p-4 rounded border border-zinc-200 mb-6">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">NAMA PASIEN / ID:</span>
                <strong className="text-black text-sm">{patientProfile.name}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">KLINIS / DIAGNOSIS:</span>
                <strong className="text-black text-sm">{patientProfile.conditions || 'Umum'}</strong>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">FISIK PASIEN:</span>
                <span className="text-black block">{patientProfile.age} Th • {patientProfile.gender} • {patientProfile.weight} kg • {patientProfile.height} cm</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">REGIMEN TERAPI:</span>
                <span className="text-black block font-bold">{activeMedications.join(', ') || 'Tidak ada'}</span>
              </div>
            </div>

            {/* Main Report Body */}
            <div className="space-y-6">
              
              {/* Part 1: Real-time Diet Logs conflicts */}
              {activeDietInteractions.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-zinc-300 pb-1.5 flex items-center gap-1.5">
                    1. Deteksi Konflik Log Diet Aktif Pasien
                  </h2>
                  <div className="space-y-3">
                    {activeDietInteractions.map((item, idx) => (
                      <div key={idx} className="p-4 border border-zinc-300 rounded bg-zinc-50/50 space-y-2">
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-1">
                          <span className="text-xs font-bold text-black uppercase font-mono">
                            {item.medication} ⇄ {item.nutrient}
                          </span>
                          <span className="text-[10px] font-bold font-mono uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-800 leading-relaxed">
                          ⚠️ Pasien terdeteksi mengonsumsi <strong className="text-black font-semibold">{item.foodName}</strong> harian yang sarat akan <strong className="text-black font-semibold">{item.nutrient}</strong> bersamaan dengan jadwal terapi obat ini.
                        </p>
                        <div className="text-xs text-zinc-700 font-serif leading-relaxed pl-3 border-l-2 border-black">
                          <strong>Mekanisme Klinis:</strong> {item.mechanism}
                        </div>
                        <div className="text-xs text-zinc-700 font-serif leading-relaxed pl-3 border-l-2 border-black">
                          <strong>Rekomendasi Ahli Gizi:</strong> {item.recommendation}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          PROTOKOL KONSUMSI: {item.timingAdvice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Part 2: Prescription Interactions */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-black border-b border-zinc-300 pb-1.5">
                  2. Lembar Skrining Risiko Klinis (Farmakologi Gizi)
                </h2>

                {activeInteractions.length > 0 ? (
                  <div className="space-y-4">
                    {activeInteractions.map((item, idx) => (
                      <div key={idx} className="p-4 border border-zinc-300 rounded space-y-2">
                        <div className="flex justify-between items-center border-b border-zinc-200 pb-1">
                          <div>
                            <span className="text-xs font-bold text-black uppercase font-mono">{item.drugName}</span>
                            <span className="text-[9px] text-zinc-500 font-mono"> ({item.drugClass})</span>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 px-1 py-0.5 rounded">Evidensi {item.evidenceLevel}</span>
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              {item.severity}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs font-mono">
                          Bahan Makanan / Nutrien yang Berbenturan: <strong className="text-black font-bold uppercase">{item.nutrient}</strong>
                        </div>

                        <div className="text-xs text-zinc-700 leading-relaxed">
                          <strong>Mekanisme Interaksi:</strong> {item.mechanism}
                        </div>

                        <div className="text-xs text-zinc-800 font-medium leading-relaxed bg-zinc-50 p-2.5 rounded border border-zinc-200">
                          <strong>Intervensi & Solusi Diet:</strong> {item.recommendation}
                        </div>

                        <div className="text-[10px] font-mono text-zinc-500">
                          SARAN JADWAL KONSUMSI: {item.timingAdvice}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-zinc-200 rounded text-center text-xs text-zinc-500 font-sans italic">
                    Skrining resep bersih. Tidak ditemukan interaksi obat-nutrisi berbahaya dalam database primer.
                  </div>
                )}
              </div>

            </div>

            {/* Signature Area */}
            <div className="mt-12 pt-8 border-t border-dashed border-zinc-300 flex justify-between items-end text-xs font-mono">
              <div>
                <p className="text-zinc-500">Dibuat Otomatis Oleh:</p>
                <strong className="text-black block mt-1">Nutri-Intelligence Platform v5.8</strong>
                <span className="text-[10px] text-zinc-500">Sistem Skrining Presisi WHO & AKG 2019</span>
              </div>
              <div className="text-center w-52">
                <div className="h-16 border-b border-black"></div>
                <span className="block mt-1 text-zinc-600 uppercase">TANDA TANGAN DIETISIEN / APOTEKER</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
