import React, { useState, useMemo } from "react";
import { oilsAndFatsDatabase } from "../../data/oils-and-fats-complete";
import { OilAndFatItem } from "../../data/oils-and-fats-complete";
import { 
  Search, 
  Flame, 
  AlertTriangle, 
  Check, 
  Info, 
  DollarSign, 
  Sliders, 
  Activity, 
  Heart, 
  Droplet, 
  Sparkles,
  Shield,
  Clock,
  RotateCcw
} from "lucide-react";

function getOilsSynonyms(category: string): string[] {
  const catLower = category.toLowerCase();
  const synonyms: string[] = ["minyak", "oil", "lemak", "fat"];

  if (catLower.includes("coconut") || catLower.includes("kelapa")) {
    synonyms.push("kelapa", "coconut", "minyak kelapa", "barco", "kara", "cocomas");
    if (catLower.includes("virgin") || catLower.includes("vco") || catLower.includes("murni")) {
      synonyms.push("vco", "virgin coconut oil", "kelapa murni", "extra virgin");
    } else {
      synonyms.push("rbd", "cooking coconut oil", "minyak kelapa rbd", "minyak goreng kelapa");
    }
  }
  if (catLower.includes("palm") || catLower.includes("sawit")) {
    synonyms.push("sawit", "palm", "kelapa sawit", "minyak sawit", "minyak kelapa sawit", "minyak goreng sawit", "bimoli", "filma", "tropical", "sunco");
  }
  if (catLower.includes("jelantah")) {
    synonyms.push("jelantah", "bekas", "gorengan", "reused", "used oil");
  }
  if (catLower.includes("margarin")) {
    synonyms.push("margarin", "margarine", "blueband", "simas", "mentega industri");
  }
  if (catLower.includes("mentega") || catLower.includes("butter")) {
    synonyms.push("mentega", "butter", "susu", "animal fat", "lemak susu", "anchor");
  }
  if (catLower.includes("ghee") || catLower.includes("samin")) {
    synonyms.push("ghee", "samin", "minyak samin", "clarified butter");
  }
  if (catLower.includes("shortening") || catLower.includes("mentega putih")) {
    synonyms.push("shortening", "mentega putih", "putih", "bakers fat");
  }
  if (catLower.includes("wijen") || catLower.includes("sesame")) {
    synonyms.push("wijen", "sesame", "minyak wijen");
  }
  if (catLower.includes("zaitun") || catLower.includes("olive")) {
    synonyms.push("zaitun", "olive", "evoo", "ekstra virgin", "minyak zaitun", "bertolli", "filippo", "borges");
  }
  if (catLower.includes("jagung") || catLower.includes("corn")) {
    synonyms.push("jagung", "corn", "minyak jagung", "mazola", "tropicana");
  }
  if (catLower.includes("kanola") || catLower.includes("canola")) {
    synonyms.push("kanola", "canola", "minyak kanola");
  }
  if (catLower.includes("matahari") || catLower.includes("sunflower")) {
    synonyms.push("matahari", "sunflower", "bunga matahari", "minyak bunga matahari");
  }
  if (catLower.includes("kedelai") || catLower.includes("soybean")) {
    synonyms.push("kedelai", "soy", "soybean", "minyak kedelai", "happy soya");
  }
  if (catLower.includes("kacang") || catLower.includes("peanut")) {
    synonyms.push("kacang", "peanut", "tanah", "kacang tanah", "minyak kacang");
  }
  if (catLower.includes("alpukat") || catLower.includes("avocado")) {
    synonyms.push("alpukat", "avocado", "minyak alpukat");
  }
  if (catLower.includes("anggur") || catLower.includes("grape")) {
    synonyms.push("anggur", "grape", "grapeseed", "biji anggur", "minyak biji anggur");
  }
  if (catLower.includes("dedak") || catLower.includes("rice") || catLower.includes("rbo") || catLower.includes("padi")) {
    synonyms.push("dedak", "padi", "rice bran", "rbo", "rice bran oil", "minyak dedak padi");
  }

  return synonyms;
}

export default function OilsAndFatsHub() {
  // Navigation & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<OilAndFatItem>(oilsAndFatsDatabase[0]);

  // Simulator States
  const [simBaseOilId, setSimBaseOilId] = useState<string>("oil_fat_001"); // Default: VCO atau Sawit Tradisional
  const [fryingCycles, setFryingCycles] = useState<number>(0); // 0 (Fresh) s.d 5 (Sangat Rusak)

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    oilsAndFatsDatabase.forEach(item => {
      set.add(item.category);
    });
    return ["ALL", ...Array.from(set)];
  }, []);

  // Filtered list
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) {
      return oilsAndFatsDatabase.filter(item => {
        return selectedCategory === "ALL" || item.category === selectedCategory;
      });
    }

    const searchTokens = searchTerm
      .toLowerCase()
      .split(/\s+/)
      .filter(token => token.length > 0);

    return oilsAndFatsDatabase.filter(item => {
      // Get category synonyms
      const catSynonyms = getOilsSynonyms(item.category);
      
      // Combine all searchable text for this item
      const itemText = [
        item.name,
        item.brand,
        item.description,
        item.category,
        item.recommendedUse || "",
        ...catSynonyms
      ].join(" ").toLowerCase();

      // For search to match, EVERY search token must be found in the item's text
      const matchSearch = searchTokens.every(token => itemText.includes(token));
      
      const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Ensure selected item is still valid, fallback if not
  const activeItem = useMemo(() => {
    const exists = filteredList.find(i => i.id === selectedItem.id);
    return exists || filteredList[0] || oilsAndFatsDatabase[0];
  }, [filteredList, selectedItem]);

  // Base oil for simulator
  const simBaseOil = useMemo(() => {
    return oilsAndFatsDatabase.find(o => o.id === simBaseOilId) || oilsAndFatsDatabase[0];
  }, [simBaseOilId]);

  // Simulator calculations
  const simResults = useMemo(() => {
    const base = simBaseOil;
    const sfaBase = base.fattyAcidProfile.sfa;
    const mufaBase = base.fattyAcidProfile.mufa;
    const pufaBase = base.fattyAcidProfile.pufa;
    const transBase = base.fattyAcidProfile.trans;

    // Heat and oxidation effects per cycle
    // Cycle 0: Fresh
    // Cycle 1: 1x frying (mild oxidation)
    // Cycle 2: 2x frying (breakdown of PUFA, SFA increases, trans isomers form)
    // Cycle 3: 3x frying (deep oxidation, oil darkens, trans fats double)
    // Cycle 4: 4x frying (rancid, acrylamide/acrolein form, smoke point falls 15%)
    // Cycle 5: 5x frying (toxic, highly toxic cyclic monomers, smoke point falls 25-30%)

    const cycle = fryingCycles;
    
    // Degradation multipliers
    const pufaLossFactor = Math.max(0.1, 1 - (cycle * 0.18)); // PUFA oxidizes fastest
    const mufaLossFactor = Math.max(0.4, 1 - (cycle * 0.08)); // MUFA is more stable
    
    // Adjusted fatty acids
    const pufaSim = parseFloat((pufaBase * pufaLossFactor).toFixed(2));
    const mufaSim = parseFloat((mufaBase * mufaLossFactor).toFixed(2));
    
    // Lost PUFA and MUFA are converted into saturated fats and trans isomers
    const totalLost = (pufaBase - pufaSim) + (mufaBase - mufaSim);
    const sfaGain = totalLost * 0.75;
    const transGain = totalLost * 0.25 + (cycle * 0.65); // High thermal stress creates trans fatty acids

    const sfaSim = parseFloat((sfaBase + sfaGain).toFixed(2));
    const transSim = parseFloat((transBase + transGain).toFixed(2));

    // Smoke Point reduction
    // Free fatty acids lower the smoke point
    const smokePointReduction = cycle * 12.5; // Up to 62.5C drop
    const smokePointSim = Math.round(base.smokePoint - smokePointReduction);

    // Antioxidant depletion (extremely sensitive to heat)
    const antioxRetention = Math.max(0.01, Math.pow(0.35, cycle)); // exponential decay (65% lost per cycle)
    const tocopherolSim = parseFloat((base.micronutrients.tocopherol * antioxRetention).toFixed(2));
    const tocotrienolSim = parseFloat((base.micronutrients.tocotrienol * antioxRetention).toFixed(2));
    const carotenoidsSim = parseFloat((base.micronutrients.carotenoids * antioxRetention).toFixed(2));
    const phytosterolsSim = parseFloat((base.micronutrients.phytosterols * antioxRetention).toFixed(2));

    // Polar compounds, acrolein, FFA acidity index
    const totalPolarCompounds = parseFloat((1.5 + (cycle * 4.8)).toFixed(1)); // >25% is unsafe/illegal under EU laws
    const freeFattyAcidsPercent = parseFloat((0.05 + (cycle * 0.14)).toFixed(2)); // >2.0% is highly degraded
    const acroleinRisk = cycle >= 3 ? "Tinggi (Karsinogenik Bebas)" : (cycle >= 1 ? "Sedang (Irritant Lambung)" : "Sangat Rendah");

    // Clinical risk assessment
    let cardioRisk = "Sangat Rendah";
    let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let description = "Minyak dalam kondisi segar dan aman secara gizi. Mengandung profil antioksidan optimal.";

    if (cycle === 1) {
      cardioRisk = "Rendah";
      colorClass = "text-teal-400 bg-teal-500/10 border-teal-500/20";
      description = "Pemanasan pertama mengaktifkan sedikit oksidasi lipid. Masih aman namun antioksidan mulai menyusut.";
    } else if (cycle === 2) {
      cardioRisk = "Sedang";
      colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      description = "Akumulasi asam lemak jenuh dan asam lemak trans mulai terbentuk. Direkomendasikan untuk tidak digunakan lagi.";
    } else if (cycle === 3) {
      cardioRisk = "Tinggi";
      colorClass = "text-orange-400 bg-orange-500/10 border-orange-500/20";
      description = "Kandungan Trans Fat meningkat siginifikan. Sangat meningkatkan kadar kolesterol LDL dan pembentukan plak pembuluh darah.";
    } else if (cycle >= 4) {
      cardioRisk = "Sangat Tinggi (Kritis)";
      colorClass = "text-red-400 bg-red-500/10 border-red-500/20";
      description = "Minyak Jelantah Toksik. Mengandung senyawa akrolein pemicu kanker, kadar radikal bebas sangat tinggi, merusak sel dinding endotel arteri secara masif.";
    }

    return {
      sfa: sfaSim,
      mufa: mufaSim,
      pufa: pSimLimit(pufaSim),
      trans: transSim,
      smokePoint: smokePointSim,
      tocopherol: tocopherolSim,
      tocotrienol: tocotrienolSim,
      carotenoids: carotenoidsSim,
      phytosterols: phytosterolsSim,
      polar: totalPolarCompounds,
      ffa: freeFattyAcidsPercent,
      acrolein: acroleinRisk,
      cardioRisk,
      colorClass,
      description
    };
  }, [simBaseOil, fryingCycles]);

  function pSimLimit(val: number) {
    return val < 0 ? 0 : val;
  }

  // Frying suitability
  const suitabilityVerdict = (smokePoint: number) => {
    if (smokePoint >= 230) return { label: "Sangat Cocok untuk Deep Frying (Stabil)", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" };
    if (smokePoint >= 190) return { label: "Cukup Stabil (Menumis / Pan Frying)", color: "text-teal-400 border-teal-500/20 bg-teal-500/5" };
    if (smokePoint >= 150) return { label: "Hanya untuk Saus / Dressing / Slow-Cook", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" };
    return { label: "Rentan Rusak / Jangan Dipanaskan (Dressing)", color: "text-red-400 border-red-500/20 bg-red-500/5" };
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0e] text-white" id="oils-fats-hub-tab">
      
      {/* Tab Header Banner */}
      <div className="p-4 border-b border-[#27272a] bg-gradient-to-r from-[#121214] to-[#1a1a1e] flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <Droplet className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-base font-bold tracking-tight text-white uppercase">
              Oils & Fats Hub (Indonesian Database)
            </h2>
            <span className="text-[10px] bg-[#00d4ff]/10 text-[#00d4ff] px-2 py-0.5 rounded font-mono border border-[#00d4ff]/20">
              Clinical v2.4.0
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Data referensi komprehensif 153 minyak & lemak pangan Indonesia beserta Simulator Risiko Degradasi Termal (Minyak Jelantah).
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[#a1a1aa] font-mono bg-[#161618] px-3 py-1.5 rounded-md border border-[#27272a]">
          <span className="text-emerald-400 font-bold">153 Items</span>
          <span className="text-zinc-600">|</span>
          <span>SFA • MUFA • PUFA • Trans • Smoke Point</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 flex-1 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: Search & Database List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-[#121214] border border-[#27272a] rounded-lg overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-3 border-b border-[#27272a] bg-[#161618] space-y-2">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-500">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari merek, jenis minyak (contoh: VCO, Jelantah)..."
                className="w-full bg-[#1b1b1f] border border-[#2d2d30] pl-8 pr-3 py-1.5 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00d4ff] transition"
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-mono text-zinc-500">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#1b1b1f] border border-[#2d2d30] text-zinc-300 text-xs rounded px-2 py-1 max-w-[200px] focus:outline-none focus:border-[#00d4ff]"
              >
                <option value="ALL">Semua Kategori ({categories.length - 1})</option>
                {categories.filter(c => c !== "ALL").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-[#1e1e21]">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Tidak ada minyak atau lemak yang cocok dengan pencarian Anda.
              </div>
            ) : (
              filteredList.map((item) => {
                const isActive = item.id === activeItem.id;
                const ratioSum = item.fattyAcidProfile.sfa + item.fattyAcidProfile.mufa + item.fattyAcidProfile.pufa;
                const sfaPct = Math.round((item.fattyAcidProfile.sfa / (ratioSum || 1)) * 100);
                const mufaPct = Math.round((item.fattyAcidProfile.mufa / (ratioSum || 1)) * 100);
                const pufaPct = Math.round((item.fattyAcidProfile.pufa / (ratioSum || 1)) * 100);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 cursor-pointer transition text-left flex flex-col justify-between ${
                      isActive 
                        ? "bg-[#1f2025] border-l-4 border-[#00d4ff]" 
                        : "hover:bg-[#161619]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-[#00d4ff]/80 bg-[#00d4ff]/5 px-1.5 py-0.5 rounded border border-[#00d4ff]/10">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Merek: <span className="text-zinc-200">{item.brand}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {item.smokePoint}°C
                        </span>
                        <p className="text-[8px] text-zinc-500 font-mono mt-0.5">Smoke Point</p>
                      </div>
                    </div>

                    {/* Miniature Fatty Acid Bar */}
                    <div className="mt-2.5">
                      <div className="h-1.5 w-full rounded bg-zinc-800 flex overflow-hidden">
                        <div style={{ width: `${sfaPct}%` }} className="bg-red-500" title={`SFA ${sfaPct}%`} />
                        <div style={{ width: `${mufaPct}%` }} className="bg-emerald-400" title={`MUFA ${mufaPct}%`} />
                        <div style={{ width: `${pufaPct}%` }} className="bg-amber-400" title={`PUFA ${pufaPct}%`} />
                      </div>
                      <div className="flex justify-between text-[8px] text-zinc-500 font-mono mt-1">
                        <span>SFA: {item.fattyAcidProfile.sfa}g</span>
                        <span>MUFA: {item.fattyAcidProfile.mufa}g</span>
                        <span>PUFA: {item.fattyAcidProfile.pufa}g</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMN: Details Panel & Simulator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto scrollbar-none h-full min-h-0">
          
          {/* SECTION A: DETAILED CHEMICAL PROFILE PANEL */}
          <div className="bg-[#121214] border border-[#27272a] rounded-lg p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] uppercase font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {activeItem.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{activeItem.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 italic">"{activeItem.description}"</p>
              </div>
              <div className="text-right bg-[#17171a] p-2 rounded border border-zinc-800 font-mono">
                <span className="text-xs text-zinc-500 block uppercase text-[9px]">Harga Estimasi</span>
                <span className="text-sm font-bold text-emerald-400">
                  IDR {activeItem.estimatedPrice100ml.toLocaleString()}/100ml
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-[#161619] p-2.5 rounded border border-zinc-800 text-center">
                <Flame className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <span className="text-[9px] text-zinc-500 uppercase block">Smoke Point</span>
                <span className="text-sm font-bold text-white">{activeItem.smokePoint}°C</span>
              </div>
              <div className="bg-[#161619] p-2.5 rounded border border-zinc-800 text-center">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <span className="text-[9px] text-zinc-500 uppercase block">Flash Point</span>
                <span className="text-sm font-bold text-white">{activeItem.flashPoint}°C</span>
              </div>
              <div className="bg-[#161619] p-2.5 rounded border border-zinc-800 text-center">
                <Shield className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[9px] text-zinc-500 uppercase block">RSPO Certified</span>
                <span className={`text-xs font-bold uppercase ${activeItem.rspoCertified ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {activeItem.rspoCertified ? 'YES' : 'NO/NA'}
                </span>
              </div>
              <div className="bg-[#161619] p-2.5 rounded border border-zinc-800 text-center">
                <Info className="w-4 h-4 text-[#00d4ff] mx-auto mb-1" />
                <span className="text-[9px] text-zinc-500 uppercase block">Total Fat</span>
                <span className="text-sm font-bold text-white">
                  {(activeItem.fattyAcidProfile.sfa + activeItem.fattyAcidProfile.mufa + activeItem.fattyAcidProfile.pufa).toFixed(1)}g
                </span>
              </div>
            </div>

            {/* Fatty Acid Details */}
            <div className="bg-[#161619] p-3 rounded border border-zinc-800">
              <h4 className="text-xs font-bold uppercase text-zinc-300 mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00d4ff]" /> Profil Asam Lemak (per 100g)
              </h4>

              {/* Segmented Progress Bar */}
              <div className="mt-3">
                <div className="h-4 w-full rounded bg-zinc-800 flex overflow-hidden text-[9px] font-bold text-black text-center">
                  {activeItem.fattyAcidProfile.sfa > 0 && (
                    <div style={{ width: `${activeItem.fattyAcidProfile.sfa}%` }} className="bg-red-500 flex items-center justify-center text-white" title="Saturated Fatty Acids">
                      SFA ({Math.round(activeItem.fattyAcidProfile.sfa)}%)
                    </div>
                  )}
                  {activeItem.fattyAcidProfile.mufa > 0 && (
                    <div style={{ width: `${activeItem.fattyAcidProfile.mufa}%` }} className="bg-emerald-400 flex items-center justify-center" title="Monounsaturated Fatty Acids">
                      MUFA ({Math.round(activeItem.fattyAcidProfile.mufa)}%)
                    </div>
                  )}
                  {activeItem.fattyAcidProfile.pufa > 0 && (
                    <div style={{ width: `${activeItem.fattyAcidProfile.pufa}%` }} className="bg-amber-400 flex items-center justify-center" title="Polyunsaturated Fatty Acids">
                      PUFA ({Math.round(activeItem.fattyAcidProfile.pufa)}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Numbers including Trans/Omegas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Saturated (SFA):</span>
                  <span className="text-red-400 font-bold">{activeItem.fattyAcidProfile.sfa}g</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Monounsat (MUFA):</span>
                  <span className="text-emerald-400 font-bold">{activeItem.fattyAcidProfile.mufa}g</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Polyunsat (PUFA):</span>
                  <span className="text-amber-400 font-bold">{activeItem.fattyAcidProfile.pufa}g</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Trans Fatty Acids:</span>
                  <span className={`font-bold ${activeItem.fattyAcidProfile.trans > 0.5 ? 'text-red-400' : 'text-zinc-300'}`}>
                    {activeItem.fattyAcidProfile.trans}g
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Omega-3 Fatty Acid:</span>
                  <span className="text-[#00d4ff] font-bold">{activeItem.fattyAcidProfile.omega3}g</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-500">Omega-6 Fatty Acid:</span>
                  <span className="text-purple-400 font-bold">{activeItem.fattyAcidProfile.omega6}g</span>
                </div>
              </div>
            </div>

            {/* Thermal Suitability Indicator */}
            <div className={`p-3 rounded border text-xs ${suitabilityVerdict(activeItem.smokePoint).color}`}>
              <span className="font-bold uppercase tracking-wide block mb-1">Batasan Termal (Aplikasi Kuliner)</span>
              <span>{suitabilityVerdict(activeItem.smokePoint).label}</span>
            </div>

            {/* Micronutrients Grid */}
            <div className="bg-[#161619] p-3 rounded border border-zinc-800">
              <h4 className="text-xs font-bold uppercase text-zinc-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Senyawa Mikroaktif & Antioksidan (per 100g)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                <div className="bg-[#1b1b1e] p-2 rounded text-center border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block mb-0.5">Tokoferol (Vit E)</span>
                  <span className="font-bold text-white font-mono">{activeItem.micronutrients.tocopherol} mg</span>
                </div>
                <div className="bg-[#1b1b1e] p-2 rounded text-center border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block mb-0.5">Tokotrienol</span>
                  <span className="font-bold text-white font-mono">{activeItem.micronutrients.tocotrienol} mg</span>
                </div>
                <div className="bg-[#1b1b1e] p-2 rounded text-center border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block mb-0.5">Karotenoid</span>
                  <span className="font-bold text-white font-mono">{activeItem.micronutrients.carotenoids} mg</span>
                </div>
                <div className="bg-[#1b1b1e] p-2 rounded text-center border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block mb-0.5">Fitosterol</span>
                  <span className="font-bold text-white font-mono">{activeItem.micronutrients.phytosterols} mg</span>
                </div>
              </div>
            </div>

            {/* Certifications and Recommended Uses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#161619] p-3 rounded border border-zinc-800 flex flex-col justify-between">
                <h5 className="font-bold text-zinc-300 uppercase mb-1.5">Sertifikasi & Regulasi</h5>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeItem.standards.map((std, i) => (
                    <span key={i} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded font-mono text-[10px] border border-zinc-700">
                      {std}
                    </span>
                  ))}
                  {activeItem.rspoCertified && (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-mono text-[10px] border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> RSPO Certified
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-[#161619] p-3 rounded border border-zinc-800">
                <h5 className="font-bold text-zinc-300 uppercase mb-1">Rekomendasi Klinis Penggunaan</h5>
                <p className="text-[#a1a1aa] leading-relaxed text-[11px] mt-1">
                  {activeItem.recommendedUse}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION B: MINYAK JELANTAH & CARDIORISK DEGRADATION SIMULATOR */}
          <div className="bg-[#121214] border border-[#27272a] rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase">
                  Simulator Degradasi & Risiko Kardiovaskular Minyak Goreng
                </h3>
              </div>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono border border-red-500/20">
                Aterosklerosis Plaque Predictor
              </span>
            </div>

            <p className="text-xs text-[#a1a1aa]">
              Simulasi dampak pemanasan berulang pada minyak pilihan. Lihat bagaimana lemak tak jenuh terurai menjadi senyawa toksik dan lemak trans pemicu plak kolesterol jantung.
            </p>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#161619] p-3 rounded border border-zinc-800 mt-2">
              
              {/* Select Oil */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase font-mono text-zinc-400">Pilih Minyak Utama:</label>
                <select
                  value={simBaseOilId}
                  onChange={(e) => {
                    setSimBaseOilId(e.target.value);
                    setFryingCycles(0); // Reset cycle on oil change
                  }}
                  className="bg-[#1b1b1f] border border-[#2d2d30] text-zinc-200 text-xs rounded p-2 focus:outline-none focus:border-red-500 font-medium"
                >
                  {oilsAndFatsDatabase
                    .filter(o => !o.name.includes("Jelantah") && !o.name.includes("Margarin") && !o.name.includes("Mentega")) // Fresh oils only
                    .slice(0, 15) // limit to avoid list bloat in select
                    .map(oil => (
                      <option key={oil.id} value={oil.id}>
                        {oil.name}
                      </option>
                    ))}
                </select>
                <span className="text-[9px] text-zinc-500 italic mt-0.5 line-clamp-1">
                  Merek awal: {simBaseOil.brand} ({simBaseOil.category})
                </span>
              </div>

              {/* Cooking Cycles Slider */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-mono text-zinc-400">Frekuensi Penggorengan:</label>
                  <span className="text-xs font-bold text-red-400 font-mono">
                    {fryingCycles === 0 ? "Murni (Fresh)" : `${fryingCycles}x Penggunaan`}
                  </span>
                </div>
                <div className="flex items-center gap-3 h-10">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={fryingCycles}
                    onChange={(e) => setFryingCycles(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setFryingCycles(num)}
                        className={`w-5 h-5 rounded text-[9px] font-mono font-bold flex items-center justify-center transition ${
                          fryingCycles === num 
                            ? 'bg-red-500 text-white shadow' 
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500">
                  Semakin sering digunakan, degradasi asam lemak akan merusak kesehatan gizi.
                </p>
              </div>
            </div>

            {/* Simulation Real-time Results Banner */}
            <div className={`p-4 rounded-lg border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between ${simResults.colorClass}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current animate-pulse" />
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-300">Diagnosis Klinis</span>
                    <h4 className="text-sm font-bold uppercase mt-0.5">Risiko Kardiovaskular: {simResults.cardioRisk}</h4>
                  </div>
                </div>
                <p className="text-xs text-zinc-200 mt-2 leading-relaxed">
                  {simResults.description}
                </p>
              </div>
              {fryingCycles > 0 && (
                <button 
                  onClick={() => setFryingCycles(0)} 
                  className="bg-zinc-900/40 hover:bg-zinc-900/60 text-white border border-white/10 px-2.5 py-1.5 rounded text-[10px] font-mono flex items-center gap-1 self-stretch sm:self-auto justify-center transition"
                >
                  <RotateCcw className="w-3 h-3" /> Reset ke Fresh
                </button>
              )}
            </div>

            {/* Detailed Degradation Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              
              {/* Fatty Acids & Smoke Point Comparison */}
              <div className="bg-[#161619] p-3 rounded border border-zinc-800 flex flex-col justify-between">
                <h5 className="text-[11px] font-bold uppercase text-zinc-400 mb-2 border-b border-zinc-800 pb-1.5 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-zinc-400" /> Profil Kimia & Fisik Saat Ini
                </h5>
                <div className="space-y-2 text-xs font-mono">
                  
                  {/* Smoke Point */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span>Titik Asap (Smoke Point):</span>
                      <span className={`font-bold ${simResults.smokePoint < 170 ? 'text-red-400 animate-pulse' : 'text-zinc-300'}`}>
                        {simResults.smokePoint}°C
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, (simResults.smokePoint / 260) * 100)}%` }} 
                        className={`h-full ${simResults.smokePoint < 170 ? 'bg-red-500' : (simResults.smokePoint < 200 ? 'bg-amber-400' : 'bg-emerald-500')}`} 
                      />
                    </div>
                    <span className="text-[8px] text-zinc-500 block text-right mt-0.5">
                      Suhu awal: {simBaseOil.smokePoint}°C (-{simBaseOil.smokePoint - simResults.smokePoint}°C)
                    </span>
                  </div>

                  {/* Trans Fat Accumulation */}
                  <div className="flex justify-between border-t border-zinc-800/50 pt-2 pb-1">
                    <span className="text-zinc-500">Asam Lemak Trans (Trans Fat):</span>
                    <span className={`font-bold ${simResults.trans > 1.5 ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                      {simResults.trans} g <span className="text-[10px] text-zinc-500">/100g</span>
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#1e1e21] py-1">
                    <span className="text-zinc-500">Saturated Fat (SFA):</span>
                    <span className="text-red-400 font-bold">
                      {simResults.sfa} g <span className="text-[10px] text-zinc-500">/100g</span>
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#1e1e21] py-1">
                    <span className="text-zinc-500">Monounsat (MUFA):</span>
                    <span className="text-emerald-400 font-bold">
                      {simResults.mufa} g <span className="text-[10px] text-zinc-500">/100g</span>
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#1e1e21] pt-1">
                    <span className="text-zinc-500">Polyunsat (PUFA):</span>
                    <span className="text-amber-400 font-bold">
                      {simResults.pufa} g <span className="text-[10px] text-zinc-500">/100g</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Degradation Toxins & Antioxidant Retention */}
              <div className="bg-[#161619] p-3 rounded border border-zinc-800 flex flex-col justify-between">
                <h5 className="text-[11px] font-bold uppercase text-zinc-400 mb-2 border-b border-zinc-800 pb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" /> Senyawa Toksik & Kerusakan Gizi
                </h5>
                <div className="space-y-2.5 text-xs font-mono">
                  
                  {/* Acrolein */}
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                    <span className="text-zinc-500">Akrolein (Karsinogen):</span>
                    <span className={`font-bold ${fryingCycles >= 3 ? 'text-red-400 animate-pulse' : (fryingCycles >= 1 ? 'text-amber-400' : 'text-zinc-500')}`}>
                      {simResults.acrolein}
                    </span>
                  </div>

                  {/* Acidity FFA */}
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                    <span className="text-zinc-500">Asam Lemak Bebas (FFA):</span>
                    <span className={`font-bold ${simResults.ffa > 0.4 ? 'text-red-400' : 'text-zinc-300'}`}>
                      {simResults.ffa}% <span className="text-[10px] text-zinc-500">(Acidity)</span>
                    </span>
                  </div>

                  {/* Polar Compounds */}
                  <div className="flex justify-between border-b border-zinc-800/50 pb-1.5">
                    <span className="text-zinc-500">Senyawa Polar Total (TPC):</span>
                    <span className={`font-bold ${simResults.polar >= 20 ? 'text-red-400 animate-pulse font-extrabold' : 'text-zinc-300'}`}>
                      {simResults.polar}% <span className="text-[10px] text-zinc-500">(EU Limit 25%)</span>
                    </span>
                  </div>

                  {/* Vitamin E retention */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-zinc-500">Retensi Vitamin E / Tokoferol:</span>
                      <span className="text-white font-bold">{simResults.tocopherol} mg</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 block">
                      Awal: {simBaseOil.micronutrients.tocopherol} mg (Tersisa {Math.round(Math.max(1, Math.pow(0.35, fryingCycles) * 100))}%).
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Recommendations for Clinical Practice */}
            <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800/60 text-xs">
              <span className="font-bold text-amber-400 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Edukasi Praktis untuk Pasien Kardio & Hipertensi:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-zinc-300 mt-1.5 text-[11px] leading-relaxed">
                <li>
                  <span className="font-semibold text-white">Trans Fat Isomerization:</span> Pemanasan berulang mengisomerisasi asam lemak <span className="italic">cis</span> menjadi <span className="italic">trans</span> yang menginduksi inflamasi pembuluh darah secara langsung.
                </li>
                <li>
                  <span className="font-semibold text-white">Minyak Jelantah 3x+:</span> Sangat dilarang untuk penderita <span className="font-medium text-white">Dislipidemia, Jantung Koroner, dan Diabetes</span> karena memicu stres oksidatif tubuh.
                </li>
                <li>
                  <span className="font-semibold text-white">Rekomendasi Teknik:</span> Sarankan pasien mengganti metode menggoreng dengan <span className="font-medium text-emerald-400">Air-frying, Tumis Ringan, atau Kukus</span> untuk menjaga stabilitas lipid.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
