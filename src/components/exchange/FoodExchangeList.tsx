import React, { useState, useMemo } from 'react';
import { indonesianExchangeLists, ExchangeGroup, ExchangeFood } from '../../data/food-exchange-lists';
import { useNutriStore } from '../../store/useNutriStore';
import { 
  Search, 
  Calculator, 
  BookOpen, 
  ChevronRight, 
  Sparkles, 
  Scale, 
  ArrowLeftRight, 
  X, 
  Utensils,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FoodExchangeList() {
  const { currentProjectId, projects } = useNutriStore();
  const activeProject = projects.find(p => p.id === currentProjectId);
  const patientProfile = activeProject?.patientProfile;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [exchangeTab, setExchangeTab] = useState<'glossary' | 'calculator'>('glossary');

  // Interactive substitution modal state
  const [substitutionSource, setSubstitutionSource] = useState<{
    food: ExchangeFood;
    group: ExchangeGroup;
  } | null>(null);
  const [substitutionMultiplier, setSubstitutionMultiplier] = useState<number>(1);

  // Exchange Calculator inputs
  const [calcCalories, setCalcCalories] = useState<number>(
    patientProfile?.bmr ? Math.round(patientProfile.bmr * 1.3) : 1800
  );
  const [calcProtein, setCalcProtein] = useState<number>(65);
  const [calcFat, setCalcFat] = useState<number>(50);
  const [calcCarbs, setCalcCarbs] = useState<number>(250);

  // Auto-fill calculator with patient targets if available
  const handleLoadPatientTargets = () => {
    if (patientProfile) {
      const tdee = Math.round((patientProfile.bmr || 1500) * 1.3);
      setCalcCalories(tdee);
      setCalcProtein(Math.round((tdee * 0.15) / 4));
      setCalcFat(Math.round((tdee * 0.25) / 9));
      setCalcCarbs(Math.round((tdee * 0.60) / 4));
    }
  };

  // Perform exchange distribution estimation
  const calculatePortions = () => {
    let carbsLeft = calcCarbs;
    let proteinLeft = calcProtein;
    let fatLeft = calcFat;

    // 1. Sayur portions
    const sayurPortions = 3;
    carbsLeft -= sayurPortions * 5;
    proteinLeft -= sayurPortions * 1;

    // 2. Buah portions
    const buahPortions = 2;
    carbsLeft -= buahPortions * 12;

    // 3. Susu portions
    const susuPortions = 1;
    carbsLeft -= susuPortions * 10;
    proteinLeft -= susuPortions * 7;
    fatLeft -= susuPortions * 6;

    // 4. Nabati portions
    const nabatiPortions = 2;
    carbsLeft -= nabatiPortions * 7;
    proteinLeft -= nabatiPortions * 5;
    fatLeft -= nabatiPortions * 3;

    // 5. Nasi / Karbohidrat (1 portion = 40g carbs)
    const karboPortions = Math.max(1, Math.round(carbsLeft / 40));
    proteinLeft -= karboPortions * 4;

    // 6. Protein Hewani (1 portion = 7g protein)
    const hewaniPortions = Math.max(1, Math.round(proteinLeft / 7));
    fatLeft -= hewaniPortions * 5;

    // 7. Minyak / Lemak (1 portion = 5g fat)
    const minyakPortions = Math.max(1, Math.round(fatLeft / 5));

    const totalCalculatedCalories = 
      (karboPortions * 175) + 
      (hewaniPortions * 75) + 
      (nabatiPortions * 75) + 
      (sayurPortions * 25) + 
      (buahPortions * 50) + 
      (susuPortions * 120) + 
      (minyakPortions * 50);

    return {
      karbo: karboPortions,
      hewani: hewaniPortions,
      nabati: nabatiPortions,
      sayur: sayurPortions,
      buah: buahPortions,
      susu: susuPortions,
      minyak: minyakPortions,
      calories: totalCalculatedCalories,
      protein: (karboPortions * 4) + (hewaniPortions * 7) + (nabatiPortions * 5) + (sayurPortions * 1) + (susuPortions * 7),
      fat: (hewaniPortions * 5) + (nabatiPortions * 3) + (susuPortions * 6) + (minyakPortions * 5),
      carbs: (karboPortions * 40) + (nabatiPortions * 7) + (sayurPortions * 5) + (buahPortions * 12) + (susuPortions * 10)
    };
  };

  const calculatedResult = useMemo(() => calculatePortions(), [calcCalories, calcProtein, calcFat, calcCarbs]);

  // Filter groups and foods
  const filteredGroups = useMemo(() => {
    return indonesianExchangeLists.filter(group => {
      if (selectedGroup !== 'all' && group.groupName !== selectedGroup) return false;
      return true;
    }).map(group => {
      const filteredFoods = group.foods.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...group, foods: filteredFoods };
    }).filter(group => group.foods.length > 0);
  }, [selectedGroup, searchQuery]);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-zinc-100 flex flex-col" id="exchange-list-container">
      {/* Header and Mode Toggle */}
      <div className="border-b border-zinc-800 bg-[#121212]/80 backdrop-blur-md p-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Utensils className="w-5 h-5 text-cyan-400" />
              </span>
              Daftar Bahan Makanan Penukar (DBMP)
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
              Sistem klasifikasi PERSAGI / Asosiasi Dietetik Indonesia untuk merancang pertukaran porsi makan setara gizi secara klinis.
            </p>
          </div>

          <div className="flex bg-[#18181b] p-1 rounded-xl border border-zinc-800 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => setExchangeTab('glossary')}
              className={`flex-1 md:flex-initial px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                exchangeTab === 'glossary' 
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Glossarium Porsi
            </button>
            <button
              onClick={() => setExchangeTab('calculator')}
              className={`flex-1 md:flex-initial px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                exchangeTab === 'calculator' 
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Kalkulator Penukar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {exchangeTab === 'glossary' ? (
          <div className="space-y-6">
            {/* Search and Category Filter Tabs */}
            <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Cari makanan standar penukar (misal: Tempe, Nasi, Singkong, Apel)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#18181b] text-white border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <button
                  onClick={() => setSelectedGroup('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedGroup === 'all' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold' 
                      : 'bg-[#18181b] text-zinc-400 border border-transparent hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Semua Golongan
                </button>
                {indonesianExchangeLists.map((g) => (
                  <button
                    key={g.groupName}
                    onClick={() => setSelectedGroup(g.groupName)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedGroup === g.groupName 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold' 
                        : 'bg-[#18181b] text-zinc-400 border border-transparent hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {g.groupName.split(' ')[0]} {/* Shorter tab name */}
                  </button>
                ))}
              </div>
            </div>

            {/* List Render in 2 Column Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <div 
                  key={group.groupName} 
                  className="bg-[#121212] border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col"
                >
                  {/* Group Info Header */}
                  <div className="bg-[#18181b] px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                        {group.groupName}
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{group.portionSize}</p>
                    </div>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2.5 py-1 rounded-lg font-mono border border-cyan-800/30">
                      Standard PERSAGI
                    </span>
                  </div>

                  {/* Micro Nutrients Per Portion */}
                  <div className="grid grid-cols-4 gap-1 px-4 py-2.5 border-b border-zinc-800/80 bg-[#141417]/30 text-center font-mono text-xs text-zinc-400">
                    <div className="border-r border-zinc-800"><span className="text-[10px] block text-zinc-600 font-sans">Energi</span>🔥 {group.caloriesPerPortion} kkal</div>
                    <div className="border-r border-zinc-800"><span className="text-[10px] block text-zinc-600 font-sans">Protein</span>🥩 {group.proteinPerPortion}g</div>
                    <div className="border-r border-zinc-800"><span className="text-[10px] block text-zinc-600 font-sans">Lemak</span>🥑 {group.fatPerPortion}g</div>
                    <div><span className="text-[10px] block text-zinc-600 font-sans">Karbo</span>🌾 {group.carbsPerPortion}g</div>
                  </div>

                  {/* Grid of Food Cards inside Group */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto scrollbar-thin">
                    {group.foods.map((food, fIdx) => (
                      <div 
                        key={fIdx} 
                        className="bg-[#18181b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
                      >
                        <div>
                          <div className="text-xs font-bold text-white leading-tight mb-1">{food.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400 mt-2">
                            <span className="bg-[#242427] text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700/50">{food.portionDescription}</span>
                            <span className="font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-950/50">{food.weightGrams}g</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setSubstitutionSource({ food, group });
                            setSubstitutionMultiplier(1);
                          }}
                          className="mt-4 w-full py-1.5 bg-[#1f1f23] text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black hover:border-transparent text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          Ganti dengan...
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Calculator Tab */
          <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Target Setup */}
              <div className="lg:col-span-1 bg-[#18181b] border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    Target Nutrisi Harian
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Masukkan target nutrisi pasien untuk membagi asupan menjadi porsi bahan makanan penukar harian secara seimbang.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Target Energi (kkal)</label>
                      <input
                        type="number"
                        value={calcCalories}
                        onChange={(e) => setCalcCalories(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-[#121212] text-white border border-zinc-800 rounded-lg focus:outline-none focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Target Protein (g)</label>
                      <input
                        type="number"
                        value={calcProtein}
                        onChange={(e) => setCalcProtein(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-[#121212] text-white border border-zinc-800 rounded-lg focus:outline-none focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Target Lemak (g)</label>
                      <input
                        type="number"
                        value={calcFat}
                        onChange={(e) => setCalcFat(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-[#121212] text-white border border-zinc-800 rounded-lg focus:outline-none focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Target Karbohidrat (g)</label>
                      <input
                        type="number"
                        value={calcCarbs}
                        onChange={(e) => setCalcCarbs(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-[#121212] text-white border border-zinc-800 rounded-lg focus:outline-none focus:border-cyan-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {patientProfile && (
                  <button
                    onClick={handleLoadPatientTargets}
                    className="w-full mt-6 py-2.5 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-400 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ambil dari Profil Pasien
                  </button>
                )}
              </div>

              {/* Target Matching Results */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-zinc-900 to-[#121212] border border-zinc-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Estimasi Distribusi Porsi Penukar</h4>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full font-semibold border border-cyan-800/30 flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      PERSAGI Clinical Grade
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-zinc-800">
                    <div>
                      <div className="text-[10px] text-zinc-500">Energi Penukar</div>
                      <div className="text-base font-bold font-mono text-zinc-100">{calculatedResult.calories} <span className="text-[10px] text-zinc-500">kkal</span></div>
                      <div className="text-[10px] text-zinc-600 font-sans mt-0.5">Target: {calcCalories}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Protein Penukar</div>
                      <div className="text-base font-bold font-mono text-zinc-100">{calculatedResult.protein}g</div>
                      <div className="text-[10px] text-zinc-600 font-sans mt-0.5">Target: {calcProtein}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Lemak Penukar</div>
                      <div className="text-base font-bold font-mono text-zinc-100">{calculatedResult.fat}g</div>
                      <div className="text-[10px] text-zinc-600 font-sans mt-0.5">Target: {calcFat}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">Karbo Penukar</div>
                      <div className="text-base font-bold font-mono text-zinc-100">{calculatedResult.carbs}g</div>
                      <div className="text-[10px] text-zinc-600 font-sans mt-0.5">Target: {calcCarbs}g</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 mt-4 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    Porsi dihitung otomatis untuk mendekati target makro harian ideal berdasarkan porsi standar pertukaran di Indonesia.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rencana Porsi Harian:</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Karbohidrat / Nasi & Pengganti</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Nasi, Kentang, Roti, Ubi jalar</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.karbo} Porsi</div>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Protein Hewani</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Daging sapi, Ayam, Kakap, Telur</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.hewani} Porsi</div>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Protein Nabati</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Tempe, Tahu putih, Kacang hijau</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.nabati} Porsi</div>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Sayuran Hijau / B</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Bayam, Kangkung, Wortel, Labu</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.sayur} Porsi</div>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Buah & Golongan Manis</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Pisang, Pepaya, Apel, Jeruk</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.buah} Porsi</div>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Susu & Olahan</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Susu murni, Yoghurt plain, Keju</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.susu} Porsi</div>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded-xl bg-[#16161a] flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Minyak & Lemak</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Minyak kelapa, Margarin, Santan</div>
                      </div>
                      <div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold px-3 py-1.5 rounded-lg text-xs shrink-0">{calculatedResult.minyak} Porsi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUBSTITUTION ALTERNATIVE MODAL/DRAWER */}
      <AnimatePresence>
        {substitutionSource && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121212] border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-[#18181b]">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white">Substitusi Pertukaran Bahan Makanan</h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Mencari opsi pengganti setara dalam golongan yang sama</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSubstitutionSource(null)}
                  className="p-1.5 bg-[#242427] hover:bg-red-500 hover:text-white rounded-lg text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Source Item Display and Stepper */}
                <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-semibold">Bahan Makanan Asal:</div>
                    <div className="text-lg font-extrabold text-white mt-1">{substitutionSource.food.name}</div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Golongan: <span className="text-cyan-400 font-semibold">{substitutionSource.group.groupName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-[#121212] border border-zinc-800 px-4 py-2.5 rounded-xl">
                    <div className="text-xs font-semibold text-zinc-400">Atur Jumlah Porsi:</div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSubstitutionMultiplier(m => Math.max(0.5, m - 0.5))}
                        disabled={substitutionMultiplier <= 0.5}
                        className="p-1 bg-[#1c1c20] text-zinc-300 rounded-md border border-zinc-700/80 hover:bg-zinc-800 cursor-pointer disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold font-mono text-cyan-400 w-14 text-center">{substitutionMultiplier} Porsi</span>
                      <button 
                        onClick={() => setSubstitutionMultiplier(m => m + 0.5)}
                        className="p-1 bg-[#1c1c20] text-zinc-300 rounded-md border border-zinc-700/80 hover:bg-zinc-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Macro Nutrients Equivalence Info */}
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl px-4 py-3 text-xs text-cyan-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    Total Kandungan Gizi Setara: <span className="font-mono font-bold">{Math.round(substitutionSource.group.caloriesPerPortion * substitutionMultiplier)} kkal</span> Energi,{' '}
                    <span className="font-mono font-bold">{Math.round(substitutionSource.group.proteinPerPortion * substitutionMultiplier * 10) / 10}g</span> Protein,{' '}
                    <span className="font-mono font-bold">{Math.round(substitutionSource.group.fatPerPortion * substitutionMultiplier * 10) / 10}g</span> Lemak,{' '}
                    <span className="font-mono font-bold">{Math.round(substitutionSource.group.carbsPerPortion * substitutionMultiplier * 10) / 10}g</span> Karbohidrat.
                  </div>
                </div>

                {/* Alternative items grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pilihan Pengganti Yang Setara ({substitutionSource.group.foods.length - 1} Item):
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {substitutionSource.group.foods
                      .filter(altFood => altFood.name !== substitutionSource.food.name)
                      .map((altFood, altIdx) => {
                        const originalPorsiDesc = altFood.portionDescription;
                        const originalWeight = altFood.weightGrams;
                        
                        // Parse description to attempt scaling if it contains fractions or numbers
                        // Standard representation: e.g., "¾ gelas", "1 potong sedang", "2 sdm"
                        let scaledDesc = `${substitutionMultiplier}x takaran standard (${originalPorsiDesc})`;
                        if (substitutionMultiplier === 1) {
                          scaledDesc = originalPorsiDesc;
                        } else if (substitutionMultiplier === 2) {
                          if (originalPorsiDesc.includes('1 potong')) scaledDesc = '2 potong sedang';
                          else if (originalPorsiDesc.includes('¾ gelas')) scaledDesc = '1.5 gelas';
                          else if (originalPorsiDesc.includes('2 sdm')) scaledDesc = '4 sdm';
                          else if (originalPorsiDesc.includes('1 sdt')) scaledDesc = '2 sdt';
                          else if (originalPorsiDesc.includes('1 sendok')) scaledDesc = '2 sendok';
                          else if (originalPorsiDesc.includes('1 buah')) scaledDesc = '2 buah';
                          else scaledDesc = `${substitutionMultiplier}x porsi (${originalPorsiDesc})`;
                        }

                        return (
                          <div 
                            key={altIdx}
                            className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/20 transition-all"
                          >
                            <div>
                              <div className="text-xs font-bold text-white">{altFood.name}</div>
                              <p className="text-[10px] text-zinc-500 mt-1 italic">Dapat ditukar langsung dengan porsi sama</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center">
                              <div>
                                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Takaran Saji</span>
                                <span className="text-xs font-bold text-zinc-300">{scaledDesc}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-zinc-500 block uppercase font-mono">Berat Setara</span>
                                <span className="text-xs font-extrabold font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-950/50">
                                  {Math.round(originalWeight * substitutionMultiplier)}g
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#141417]/50 flex justify-end">
                <button 
                  onClick={() => setSubstitutionSource(null)}
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
