import React, { useState } from 'react';
import { useNutriStore } from '../../store/useNutriStore';
import { calculatePediatricZScores } from '../../utils/pediatric-zscore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Baby, AlertCircle, TrendingUp, Info } from 'lucide-react';

export default function GrowthChart() {
  const { currentProjectId, projects } = useNutriStore();
  const activeProject = projects.find(p => p.id === currentProjectId);
  const patientProfile = activeProject?.patientProfile;

  const [activeMetric, setActiveMetric] = useState<'waz' | 'haz' | 'bmiz'>('waz');

  // Verify if patient is within pediatric WHO standard age range (0 to 5 years, i.e., 0 to 60 months)
  const isPediatricWHO = patientProfile ? (patientProfile.age <= 5) : false;
  
  // Calculate precise age in months
  const ageMonths = patientProfile 
    ? (patientProfile.ageMonths !== undefined ? patientProfile.ageMonths : Math.round(patientProfile.age * 12))
    : 24;

  const gender = patientProfile?.gender || 'Male';
  const weight = patientProfile?.weight || 12;
  const height = patientProfile?.height || 85;

  // Calculate Z-scores
  const zScoreData = calculatePediatricZScores(ageMonths, gender, weight, height);

  // Generate reference data for WHO lines (0 to 60 months)
  const generateReferenceCurveData = () => {
    const boysRef = {
      waz: [
        { age: 0, sdMinus3: 2.1, sdMinus2: 2.5, median: 3.3, sdPlus2: 4.4, sdPlus3: 5.0 },
        { age: 3, sdMinus3: 3.8, sdMinus2: 4.4, median: 6.4, sdPlus2: 8.0, sdPlus3: 8.8 },
        { age: 6, sdMinus3: 5.3, sdMinus2: 6.0, median: 7.9, sdPlus2: 9.8, sdPlus3: 10.8 },
        { age: 12, sdMinus3: 7.0, sdMinus2: 7.8, median: 9.6, sdPlus2: 12.0, sdPlus3: 13.3 },
        { age: 18, sdMinus3: 8.2, sdMinus2: 9.0, median: 10.9, sdPlus2: 13.7, sdPlus3: 15.3 },
        { age: 24, sdMinus3: 9.0, sdMinus2: 10.0, median: 12.2, sdPlus2: 15.3, sdPlus3: 17.0 },
        { age: 36, sdMinus3: 10.5, sdMinus2: 11.5, median: 14.3, sdPlus2: 18.0, sdPlus3: 20.0 },
        { age: 48, sdMinus3: 12.0, sdMinus2: 13.0, median: 16.3, sdPlus2: 20.8, sdPlus3: 23.5 },
        { age: 60, sdMinus3: 13.5, sdMinus2: 14.7, median: 18.3, sdPlus2: 23.5, sdPlus3: 26.5 }
      ],
      haz: [
        { age: 0, sdMinus3: 44.2, sdMinus2: 46.1, median: 49.9, sdPlus2: 53.7, sdPlus3: 55.6 },
        { age: 3, sdMinus3: 55.3, sdMinus2: 57.3, median: 61.4, sdPlus2: 65.5, sdPlus3: 67.6 },
        { age: 6, sdMinus3: 62.4, sdMinus2: 64.0, median: 67.6, sdPlus2: 71.2, sdPlus3: 73.3 },
        { age: 12, sdMinus3: 71.0, sdMinus2: 72.6, median: 75.7, sdPlus2: 79.7, sdPlus3: 81.7 },
        { age: 18, sdMinus3: 76.9, sdMinus2: 78.5, median: 81.5, sdPlus2: 85.5, sdPlus3: 87.7 },
        { age: 24, sdMinus3: 81.7, sdMinus2: 83.2, median: 87.1, sdPlus2: 91.1, sdPlus3: 93.0 },
        { age: 36, sdMinus3: 90.0, sdMinus2: 91.6, median: 96.1, sdPlus2: 100.5, sdPlus3: 103.5 },
        { age: 48, sdMinus3: 95.8, sdMinus2: 98.0, median: 103.3, sdPlus2: 108.5, sdPlus3: 111.3 },
        { age: 60, sdMinus3: 102.2, sdMinus2: 104.5, median: 110.0, sdPlus2: 115.5, sdPlus3: 118.8 }
      ],
      bmiz: [
        { age: 0, sdMinus3: 11.1, sdMinus2: 11.9, median: 13.4, sdPlus2: 15.3, sdPlus3: 16.1 },
        { age: 3, sdMinus3: 13.8, sdMinus2: 14.6, median: 16.5, sdPlus2: 18.7, sdPlus3: 19.6 },
        { age: 6, sdMinus3: 14.4, sdMinus2: 15.2, median: 17.2, sdPlus2: 19.5, sdPlus3: 20.4 },
        { age: 12, sdMinus3: 14.0, sdMinus2: 14.8, median: 16.8, sdPlus2: 19.0, sdPlus3: 20.0 },
        { age: 18, sdMinus3: 13.6, sdMinus2: 14.4, median: 16.4, sdPlus2: 18.5, sdPlus3: 19.5 },
        { age: 24, sdMinus3: 13.3, sdMinus2: 14.1, median: 16.0, sdPlus2: 18.2, sdPlus3: 19.1 },
        { age: 36, sdMinus3: 12.9, sdMinus2: 13.7, median: 15.7, sdPlus2: 17.8, sdPlus3: 18.8 },
        { age: 48, sdMinus3: 12.6, sdMinus2: 13.4, median: 15.4, sdPlus2: 17.6, sdPlus3: 18.6 },
        { age: 60, sdMinus3: 12.3, sdMinus2: 13.1, median: 15.3, sdPlus2: 17.5, sdPlus3: 18.6 }
      ]
    };

    const girlsRef = {
      waz: [
        { age: 0, sdMinus3: 2.0, sdMinus2: 2.4, median: 3.2, sdPlus2: 4.2, sdPlus3: 4.8 },
        { age: 3, sdMinus3: 3.4, sdMinus2: 4.0, median: 5.8, sdPlus2: 7.5, sdPlus3: 8.2 },
        { age: 6, sdMinus3: 4.8, sdMinus2: 5.5, median: 7.3, sdPlus2: 9.3, sdPlus3: 10.2 },
        { age: 12, sdMinus3: 6.3, sdMinus2: 7.1, median: 8.9, sdPlus2: 11.3, sdPlus3: 12.5 },
        { age: 18, sdMinus3: 7.4, sdMinus2: 8.2, median: 10.2, sdPlus2: 13.0, sdPlus3: 14.4 },
        { age: 24, sdMinus3: 8.2, sdMinus2: 9.2, median: 11.5, sdPlus2: 14.6, sdPlus3: 16.2 },
        { age: 36, sdMinus3: 9.6, sdMinus2: 10.8, median: 13.8, sdPlus2: 17.6, sdPlus3: 19.5 },
        { age: 48, sdMinus3: 11.0, sdMinus2: 12.4, median: 16.0, sdPlus2: 20.5, sdPlus3: 22.8 },
        { age: 60, sdMinus3: 12.4, sdMinus2: 14.0, median: 18.1, sdPlus2: 23.2, sdPlus3: 25.8 }
      ],
      haz: [
        { age: 0, sdMinus3: 43.6, sdMinus2: 45.4, median: 49.2, sdPlus2: 52.9, sdPlus3: 54.7 },
        { age: 3, sdMinus3: 54.0, sdMinus2: 55.9, median: 59.8, sdPlus2: 63.8, sdPlus3: 65.7 },
        { age: 6, sdMinus3: 60.8, sdMinus2: 62.5, median: 65.7, sdPlus2: 69.0, sdPlus3: 71.0 },
        { age: 12, sdMinus3: 69.2, sdMinus2: 71.0, median: 74.0, sdPlus2: 77.8, sdPlus3: 79.7 },
        { age: 18, sdMinus3: 74.9, sdMinus2: 76.7, median: 80.0, sdPlus2: 84.1, sdPlus3: 86.0 },
        { age: 24, sdMinus3: 80.0, sdMinus2: 81.7, median: 85.7, sdPlus2: 89.8, sdPlus3: 91.7 },
        { age: 36, sdMinus3: 88.8, sdMinus2: 90.7, median: 95.1, sdPlus2: 99.8, sdPlus3: 103.1 },
        { age: 48, sdMinus3: 95.0, sdMinus2: 97.3, median: 102.7, sdPlus2: 108.0, sdPlus3: 111.3 },
        { age: 60, sdMinus3: 101.4, sdMinus2: 103.8, median: 109.4, sdPlus2: 115.0, sdPlus3: 118.5 }
      ],
      bmiz: [
        { age: 0, sdMinus3: 10.9, sdMinus2: 11.7, median: 13.3, sdPlus2: 15.1, sdPlus3: 16.0 },
        { age: 3, sdMinus3: 13.5, sdMinus2: 14.3, median: 16.2, sdPlus2: 18.4, sdPlus3: 19.3 },
        { age: 6, sdMinus3: 14.0, sdMinus2: 14.8, median: 16.9, sdPlus2: 19.1, sdPlus3: 20.0 },
        { age: 12, sdMinus3: 13.7, sdMinus2: 14.5, median: 16.5, sdPlus2: 18.7, sdPlus3: 19.7 },
        { age: 18, sdMinus3: 13.3, sdMinus2: 14.1, median: 16.1, sdPlus2: 18.2, sdPlus3: 19.2 },
        { age: 24, sdMinus3: 13.0, sdMinus2: 13.8, median: 15.8, sdPlus2: 17.9, sdPlus3: 18.9 },
        { age: 36, sdMinus3: 12.6, sdMinus2: 13.4, median: 15.4, sdPlus2: 17.5, sdPlus3: 18.5 },
        { age: 48, sdMinus3: 12.3, sdMinus2: 13.1, median: 15.2, sdPlus2: 17.3, sdPlus3: 18.3 },
        { age: 60, sdMinus3: 12.0, sdMinus2: 12.8, median: 15.1, sdPlus2: 17.2, sdPlus3: 18.2 }
      ]
    };

    const source = gender === 'Male' ? boysRef : girlsRef;
    return source[activeMetric];
  };

  const chartData = generateReferenceCurveData();

  const getPatientCurrentVal = () => {
    if (activeMetric === 'waz') return weight;
    if (activeMetric === 'haz') return height;
    const heightM = height / 100;
    return parseFloat((weight / (heightM * heightM)).toFixed(1));
  };

  const patientValue = getPatientCurrentVal();

  const getMetricTitle = () => {
    if (activeMetric === 'waz') return 'Berat Badan menurut Umur (WAZ)';
    if (activeMetric === 'haz') return 'Tinggi Badan menurut Umur (HAZ)';
    return 'Indeks Massa Tubuh menurut Umur (BMIZ)';
  };

  const getMetricUnit = () => {
    if (activeMetric === 'waz') return 'kg';
    if (activeMetric === 'haz') return 'cm';
    return 'kg/m²';
  };

  const getActiveZScore = () => {
    if (activeMetric === 'waz') return zScoreData.waz;
    if (activeMetric === 'haz') return zScoreData.haz;
    return zScoreData.bmiz;
  };

  const getActiveStatus = () => {
    if (activeMetric === 'waz') return zScoreData.status.waz;
    if (activeMetric === 'haz') return zScoreData.status.haz;
    return zScoreData.status.bmiz;
  };

  const getActiveDetail = () => {
    if (activeMetric === 'waz') return zScoreData.details.wazLabel;
    if (activeMetric === 'haz') return zScoreData.details.hazLabel;
    return zScoreData.details.bmizLabel;
  };

  if (!patientProfile) {
    return (
      <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
        Data profil pasien kosong. Harap buat proyek baru.
      </div>
    );
  }

  // Fallback UI if patient is not pediatric
  if (!isPediatricWHO || ageMonths > 60) {
    return (
      <div className="bg-[#121212] border border-[#27272a] rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6" id="non-pediatric-growth-card">
        <div className="bg-[#00d4ff]/10 p-4 rounded-xl text-[#00d4ff] flex shrink-0 items-center justify-center">
          <Baby className="w-8 h-8 text-[#00d4ff]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            Kurva Pertumbuhan WHO Pediatric
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-lg leading-relaxed">
            Kurva antropometri interaktif WHO dan klasifikasi klinis Kemenkes RI hanya berlaku untuk pasien anak rentang usia <strong className="font-semibold text-zinc-200">0 s/d 60 bulan (5 tahun)</strong>.
          </p>
          <div className="mt-3 inline-flex bg-[#1a1a1a] text-[11px] text-[#00d4ff] px-3 py-1.5 rounded-lg border border-[#00d4ff]/20 font-medium">
            Usia Pasien Aktif: {patientProfile.age} Tahun ({ageMonths} Bulan) - {patientProfile.gender === "Male" ? "Laki-laki" : "Perempuan"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] border border-[#27272a] rounded-xl shadow-xl overflow-hidden" id="pediatric-growth-card">
      <div className="p-6 border-b border-zinc-800 bg-[#18181b]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
            <Baby className="w-5 h-5 text-[#00d4ff]" />
            Kartu Menuju Sehat (KMS) & Kurva Pertumbuhan WHO
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Visualisasi posisi antropometrik anak terhadap populasi referensi dunia WHO.
          </p>
        </div>

        <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-zinc-800 w-full md:w-auto self-stretch md:self-auto">
          <button
            onClick={() => setActiveMetric('waz')}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              activeMetric === 'waz' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            WAZ (Berat)
          </button>
          <button
            onClick={() => setActiveMetric('haz')}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              activeMetric === 'haz' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            HAZ (Tinggi)
          </button>
          <button
            onClick={() => setActiveMetric('bmiz')}
            className={`flex-1 md:flex-initial px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              activeMetric === 'bmiz' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            BMIZ (IMT)
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left clinical diagnosis card */}
        <div className="lg:col-span-1 flex flex-col justify-between border border-[#27272a] p-5 rounded-xl bg-[#18181b]/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold text-[#00d4ff] uppercase tracking-wider">Antropometri Anak</span>
            </div>

            <div className="mt-4">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Pasien</div>
              <div className="text-sm font-bold text-white mt-0.5">{patientProfile.name}</div>
              <div className="text-[11px] text-zinc-400 mt-1">
                {gender === 'Male' ? 'Anak Laki-laki' : 'Anak Perempuan'} • {ageMonths} Bulan
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Z-Score {activeMetric.toUpperCase()}</div>
              <div className="text-2xl font-black font-mono text-white mt-1 flex items-baseline gap-1.5">
                {getActiveZScore() > 0 ? `+${getActiveZScore()}` : getActiveZScore()}
                <span className="text-[10px] font-medium text-zinc-500 font-sans">SD</span>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-[#1a1a1a] rounded-lg border border-zinc-800">
              <div className="text-[10px] uppercase font-bold font-mono text-[#00d4ff]">Diagnosis Kemenkes RI:</div>
              <div className="text-xs font-extrabold text-white mt-1">{getActiveStatus()}</div>
              <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                {getActiveDetail()}
              </p>
            </div>
          </div>

          {/* Warning flags if any */}
          {zScoreData.flags.length > 0 ? (
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex gap-2 items-start text-[10px] text-red-400 font-bold uppercase tracking-wider font-mono">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Intervensi Klinis Diperlukan</span>
              </div>
              <div className="text-[11px] text-red-400 mt-1.5 space-y-1">
                {zScoreData.flags.map((flag, fIdx) => (
                  <div key={fIdx} className="leading-relaxed">• {flag}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Status Tumbuh Kembang Baik</div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Antropometri berada dalam jalur tumbuh sehat WHO.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Recharts panel */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">{getMetricTitle()}</h3>
            <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-400">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-red-500"></span> -3 SD</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-500"></span> -2 SD</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-500"></span> Median (Ideal)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#00d4ff]"></span> Pasien</span>
            </div>
          </div>

          <div className="h-72 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis 
                  dataKey="age" 
                  name="Umur (Bulan)" 
                  type="number"
                  domain={[0, 60]}
                  tickCount={9}
                  stroke="#52525b"
                />
                <YAxis 
                  domain={activeMetric === 'waz' ? [2, 30] : activeMetric === 'haz' ? [40, 125] : [10, 22]} 
                  stroke="#52525b"
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} ${getMetricUnit()}`, '']}
                  labelFormatter={(label) => `Umur: ${label} Bulan`}
                  contentStyle={{ background: '#121212', borderRadius: '8px', border: '1px solid #27272a', color: '#fff', fontSize: '10px' }}
                />
                
                {/* Reference Lines */}
                <Line type="monotone" dataKey="sdPlus3" stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 4" dot={false} activeDot={false} name="+3 SD" />
                <Line type="monotone" dataKey="sdPlus2" stroke="#eab308" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} name="+2 SD" />
                <Line type="monotone" dataKey="median" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={false} name="Median (Ideal)" />
                <Line type="monotone" dataKey="sdMinus2" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} name="-2 SD" />
                <Line type="monotone" dataKey="sdMinus3" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" dot={false} activeDot={false} name="-3 SD" />
                
                {/* Highlight Dot representing active patient coordinates */}
                <ReferenceDot 
                  x={ageMonths} 
                  y={patientValue} 
                  r={8} 
                  fill="#00d4ff" 
                  stroke="#ffffff" 
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 bg-[#1a1a1a] border border-zinc-800 rounded-lg flex gap-2.5 items-center text-xs text-zinc-400">
            <Info className="w-4 h-4 text-[#00d4ff] shrink-0" />
            <span>
              Titik <strong className="text-[#00d4ff] font-semibold">Cyan</strong> melambangkan koordinat antropometri pasien Anda saat ini (<strong>{patientValue} {getMetricUnit()}</strong> pada usia <strong>{ageMonths} Bulan</strong>).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
