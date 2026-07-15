import React, { useState } from "react";
import { HelpCircle, Keyboard, BookOpen, UserCheck, Play, ArrowRight, CheckCircle2 } from "lucide-react";

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: "Panduan Cepat" | "Metodologi" | "Navigasi & Shortcuts";
  content: string;
}

interface HelpSystemProps {
  onStartTour: () => void;
}

export default function HelpSystem({ onStartTour }: HelpSystemProps) {
  const [activeTopic, setActiveTopic] = useState<string | null>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  const topics: HelpTopic[] = [
    {
      id: "getting-started",
      title: "Memulai dengan Nutri-Intelligence",
      category: "Panduan Cepat",
      description: "Panduan singkat pendaftaran pasien hingga output rekomendasi diet.",
      content: `
        <h3 class="text-[#00d4ff] font-bold text-sm mb-2">Workflow Utama Platform</h3>
        <p class="text-xs text-zinc-300 leading-relaxed mb-4">
          Platform Nutri-Intelligence dirancang untuk asisten gizi dan dokter spesialis gizi klinik guna mengevaluasi asupan diet dan menyusun intervensi nutrisi secara cepat dan saintifik.
        </p>
        <ol class="space-y-3 text-xs text-zinc-400 list-decimal pl-4 mb-4">
          <li>
            <strong class="text-white">Registrasi Profil Pasien:</strong> Buka tab <span class="text-purple-400">Patient Profile & BMR</span> untuk mendaftarkan nama, tinggi, berat, usia, tingkat aktivitas, dan menghitung target harian (TDEE).
          </li>
          <li>
            <strong class="text-white">Input Riwayat Makanan (Food Log):</strong> Masukkan makanan harian pasien di tab <span class="text-sky-400">Nutrient Spreadsheet</span> menggunakan nama pangan atau kode TKPI. Tentukan gramasi porsi untuk kalkulasi realtime otomatis.
          </li>
          <li>
            <strong class="text-white">Analisis Defisit & Grafik:</strong> Gunakan tab <span class="text-emerald-400">Clinical Analytics</span> untuk meninjau grafik serapan makronutrien dan mikronutrien harian serta rekomendasi resep subtitusi gizi.
          </li>
          <li>
            <strong class="text-white">Ekspor Rekomendasi Medis:</strong> Cetak dokumen legal klinis di tab <span class="text-pink-400">Assessment Report</span> atau ekspor ke PDF/Word/Excel.
          </li>
        </ol>
      `
    },
    {
      id: "metrology",
      title: "Metodologi Kalkulasi Gizi",
      category: "Metodologi",
      description: "Bagaimana Harris-Benedict, Mifflin, dan LP Optimizer memproses data gizi.",
      content: `
        <h3 class="text-[#7c3aed] font-bold text-sm mb-2">Formula & Perhitungan Klinis</h3>
        <p class="text-xs text-zinc-300 leading-relaxed mb-4">
          Semua perhitungan energi dasar (BMR) mendukung standar internasional terpercaya:
        </p>
        <ul class="space-y-2 text-xs text-zinc-400 list-disc pl-4 mb-4">
          <li>
            <strong class="text-white">Mifflin-St Jeor:</strong> Formula utama yang terbukti paling akurat untuk penderita obesitas dan individu sehat modern.
          </li>
          <li>
            <strong class="text-white">Harris-Benedict:</strong> Formula klasik berdasarkan berat badan, tinggi badan, usia, dan gender.
          </li>
          <li>
            <strong class="text-white">Linear Programming Optimizer:</strong> Algoritma matematika berbasis simplex solver yang menyusun proporsi porsi optimal makanan secara otomatis untuk memenuhi asupan protein/lemak/karbohidrat minimum dengan biaya atau kalori terendah.
          </li>
        </ul>
      `
    },
    {
      id: "shortcuts",
      title: "Keyboard Shortcuts & Navigasi Cepat",
      category: "Navigasi & Shortcuts",
      description: "Daftar hotkeys global untuk memaksimalkan kecepatan klinis.",
      content: `
        <h3 class="text-amber-400 font-bold text-sm mb-2">Daftar Hotkeys Global</h3>
        <p class="text-xs text-zinc-300 leading-relaxed mb-4">
          Gunakan pintasan keyboard berikut tanpa memegang mouse untuk meningkatkan efisiensi kerja harian Anda:
        </p>
        <div class="border border-zinc-800 rounded overflow-hidden">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
                <th class="p-2">Hotkeys</th>
                <th class="p-2">Fungsi Pintasan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-900 text-zinc-400">
              <tr>
                <td class="p-2 text-white font-bold">Ctrl + K</td>
                <td class="p-2">Membuka Command Palette / Pencarian Cepat</td>
              </tr>
              <tr>
                <td class="p-2 text-white font-bold">Ctrl + M</td>
                <td class="p-2">Membuat File Pasien / Record Baru</td>
              </tr>
              <tr>
                <td class="p-2 text-white font-bold">Ctrl + P</td>
                <td class="p-2">Membuka Tab Utama Spreadsheet Log Makanan</td>
              </tr>
              <tr>
                <td class="p-2 text-white font-bold">ESC</td>
                <td class="p-2">Menutup dialog modal yang aktif secara instan</td>
              </tr>
              <tr>
                <td class="p-2 text-white font-bold">F1</td>
                <td class="p-2">Membuka pusat dokumentasi bantuan klinis</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
    }
  ];

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTopicData = topics.find((t) => t.id === activeTopic) || topics[0];

  return (
    <div className="flex flex-col h-full overflow-hidden" id="help-system-container">
      {/* Help Hero Header */}
      <div className="p-6 border-b border-[#27272a] bg-gradient-to-r from-[#121212] to-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#00d4ff]" />
            <span>Dokumentasi & Bantuan Klinis</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Panduan metodologi gizi, kalkulator dasar BMR, dan pintasan keyboard.
          </p>
        </div>

        {/* Quick Tour Button */}
        <button
          onClick={onStartTour}
          className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[#00d4ff] hover:text-[#00e4ff] text-xs px-4 py-2 rounded-lg transition-all shadow-md font-medium"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Mulai Panduan Tur Interaktif</span>
        </button>
      </div>

      {/* Main body split layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0a0a0a]">
        {/* Left Topics list */}
        <div className="w-[300px] border-r border-[#27272a] p-4 flex flex-col overflow-y-auto space-y-4">
          {/* Quick filter input */}
          <input
            type="text"
            placeholder="Cari topik bantuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
          />

          <div className="space-y-3">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeTopic === topic.id
                    ? "bg-[#1a1a1a] border-[#00d4ff]/40 text-white"
                    : "bg-[#121212]/50 border-zinc-800/60 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
                }`}
              >
                <span className="text-[9px] font-mono font-semibold text-[#00d4ff] bg-[#00d4ff]/10 px-1.5 py-0.5 rounded block w-fit mb-1">
                  {topic.category}
                </span>
                <h4 className="text-xs font-semibold leading-snug">{topic.title}</h4>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal line-clamp-2">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Topic Viewer */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#0a0a0a] border-l border-zinc-950">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-base font-bold text-white tracking-tight">
              {selectedTopicData.title}
            </h1>
            <div className="w-full h-[1px] bg-zinc-800"></div>
            
            {/* Render formatted help content */}
            <div 
              className="prose prose-invert max-w-none text-xs text-zinc-400"
              dangerouslySetInnerHTML={{ __html: selectedTopicData.content }}
            />
            
            <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <span>Metodologi terverifikasi standar PERSAGI (Kemenkes) & USDA.</span>
              <span>Updated July 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
