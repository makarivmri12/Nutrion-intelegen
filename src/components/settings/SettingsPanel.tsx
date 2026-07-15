import React, { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, ShieldCheck, Database, Volume2, Key, Download, Upload } from "lucide-react";
import { useNutriStore } from "../../store/useNutriStore";
import { getStoredSettings, saveStoredSettings, createBackup, restoreBackup } from "../../services/syncService";

export default function SettingsPanel() {
  const [settings, setLocalSettings] = useState({
    theme: "dark",
    fontSize: 14,
    autoSave: true,
    defaultDatabase: "INDONESIAN",
    audioFeedback: false,
    apiKey: ""
  });

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getStoredSettings();
    // Load existing API key if stored separately or inside settings
    const storedApiKey = localStorage.getItem("gemini_api_key") || "";
    setLocalSettings({
      ...loaded,
      apiKey: storedApiKey
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings({
      theme: settings.theme,
      fontSize: settings.fontSize,
      autoSave: settings.autoSave,
      defaultDatabase: settings.defaultDatabase,
      audioFeedback: settings.audioFeedback
    });

    if (settings.apiKey) {
      localStorage.setItem("gemini_api_key", settings.apiKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }

    // Apply font size globally
    document.documentElement.style.fontSize = `${settings.fontSize}px`;

    setMessage("Pengaturan berhasil disimpan.");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset semua preferensi sistem ke default awal?")) {
      const defaultSettings = {
        theme: "dark",
        fontSize: 14,
        autoSave: true,
        defaultDatabase: "INDONESIAN",
        audioFeedback: false,
        apiKey: ""
      };
      setLocalSettings(defaultSettings);
      saveStoredSettings(defaultSettings);
      localStorage.removeItem("gemini_api_key");
      document.documentElement.style.fontSize = "14px";
      setMessage("Pengaturan berhasil di-reset ke default.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const success = await restoreBackup(file);
      if (success) {
        alert("Backup berhasil dipulihkan! Aplikasi akan memuat ulang halaman.");
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Gagal memulihkan backup: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 text-zinc-300 font-sans" id="settings-panel-container">
      {/* Settings Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-white uppercase flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#00d4ff]" />
            <span>Sistem Preferensi & Settings</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Sesuaikan pangkalan data primer, penampilan fontasi tabel, dan kunci AI diagnostik.
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Panel 1: Database & AI config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Sumber Data & AI Diagnostik</span>
            </h3>

            {/* Default DB source */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                Database Referensi Gizi Utama
              </label>
              <p className="text-[10px] text-zinc-500 mb-2">
                Pilih pangkalan pangan bawaan saat membuka spreadsheet asisten.
              </p>
              <select
                value={settings.defaultDatabase}
                onChange={(e) => setLocalSettings({ ...settings, defaultDatabase: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
              >
                <option value="INDONESIAN">Indonesian TKPI (Komposisi Pangan Kemenkes)</option>
                <option value="USDA">USDA FoodData Central SR28</option>
                <option value="BLS">German BLS (Bundeslebensmittelschlüssel)</option>
                <option value="FAO">FAO Nutritional Minilist</option>
              </select>
            </div>

            {/* AI Custom API Key proxy */}
            <div className="space-y-1 pt-2">
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                <span>Gemini API Key (Kustomisasi Mandiri)</span>
                <span className="text-[9px] text-[#00d4ff] bg-[#00d4ff]/10 px-1.5 py-0.5 rounded font-bold">Optional</span>
              </label>
              <p className="text-[10px] text-zinc-500 mb-2">
                Ubah kunci API secara dinamis untuk query diagnostik tak terbatas jika Anda memiliki langganan Google Cloud Platform pribadi.
              </p>
              <div className="relative">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.apiKey}
                  onChange={(e) => setLocalSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] font-mono pr-10"
                />
                <Key className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </div>

          {/* Panel 2: Visual & Interface */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase border-b border-zinc-800 pb-2 flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-[#00d4ff]" />
              <span>Sistem Tampilan & Aksesibilitas</span>
            </h3>

            {/* Font Size slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                <span>Ukuran Fontasi Tabel Spreadsheet</span>
                <span className="text-white font-bold">{settings.fontSize}px</span>
              </div>
              <p className="text-[10px] text-zinc-500 mb-2">
                Tingkatkan legibilitas sel-sel resep gizi di monitor klinis besar.
              </p>
              <input
                type="range"
                min="12"
                max="18"
                step="1"
                value={settings.fontSize}
                onChange={(e) => setLocalSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00d4ff]"
              />
            </div>

            {/* Autosave setting toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5 pr-4">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                  Auto-Save 30 Detik
                </label>
                <p className="text-[10px] text-zinc-500">
                  Sinkronisasi harian otomatis ke IndexedDB lokal untuk mencegah data crash.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setLocalSettings({ ...settings, autoSave: e.target.checked })}
                className="w-4 h-4 bg-[#1a1a1a] border-[#27272a] rounded focus:ring-0 focus:outline-none accent-[#00d4ff]"
              />
            </div>

            {/* Audio feedback toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5 pr-4">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                  Efek Feedback Audio
                </label>
                <p className="text-[10px] text-zinc-500">
                  Suara detak halus saat entri log gizi baru berhasil ditambahkan ke tabel.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.audioFeedback}
                onChange={(e) => setLocalSettings({ ...settings, audioFeedback: e.target.checked })}
                className="w-4 h-4 bg-[#1a1a1a] border-[#27272a] rounded focus:ring-0 focus:outline-none accent-[#00d4ff]"
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Data backup and restore actions */}
        <div className="space-y-6">
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase border-b border-zinc-800 pb-2">
              Data Backup & Rescue
            </h3>

            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Disarankan untuk melakukan ekspor backup format JSON secara berkala agar Anda dapat memulihkan resep gizi pasien di browser lain.
            </p>

            <button
              type="button"
              onClick={createBackup}
              className="w-full flex items-center justify-center space-x-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium py-2 rounded transition-colors text-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor Backup JSON</span>
            </button>

            <div className="w-full h-[1px] bg-zinc-800 my-2"></div>

            <label className="w-full flex items-center justify-center space-x-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium py-2 rounded cursor-pointer transition-colors text-xs">
              <Upload className="w-4 h-4 text-[#00d4ff]" />
              <span>Impor Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase border-b border-zinc-800 pb-2">
              Konfirmasi Simpan
            </h3>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold py-2.5 rounded transition-all text-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center space-x-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white font-medium py-2 rounded transition-all text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kembalikan Default</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
