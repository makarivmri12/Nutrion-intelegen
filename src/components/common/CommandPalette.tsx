import React, { useState, useEffect, useRef } from "react";
import { Search, Terminal, Clipboard, Users, ShieldAlert, FileSpreadsheet, Settings2 } from "lucide-react";
import { useNutriStore } from "../../store/useNutriStore";
import { AppTab } from "../../types";

interface CommandItem {
  id: string;
  title: string;
  shortcut?: string;
  action: () => void;
  section: string;
  icon: React.ReactNode;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setTab, createNewProject, importSampleProject } = useNutriStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: "nav-spreadsheet",
      title: "Buka Nutrient Spreadsheet",
      shortcut: "Ctrl+P (Sheet)",
      action: () => setTab(AppTab.SPREADSHEET),
      section: "Navigasi",
      icon: <FileSpreadsheet className="w-4 h-4 text-[#00d4ff]" />
    },
    {
      id: "nav-patient",
      title: "Buka Profil Pasien & BMR",
      action: () => setTab(AppTab.PATIENT_PROFILE),
      section: "Navigasi",
      icon: <Users className="w-4 h-4 text-[#7c3aed]" />
    },
    {
      id: "nav-analytics",
      title: "Buka Clinical Analytics Dashboard",
      action: () => setTab(AppTab.ANALYTICS),
      section: "Navigasi",
      icon: <Terminal className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "nav-ffq",
      title: "Buka FFQ & Diet History Form",
      action: () => setTab(AppTab.FFQ_DIET),
      section: "Navigasi",
      icon: <Clipboard className="w-4 h-4 text-pink-500" />
    },
    {
      id: "nav-optimizer",
      title: "Buka LP Diet Optimizer (Alat Optimasi)",
      action: () => setTab(AppTab.OPTIMIZER),
      section: "Alat Klinis",
      icon: <Settings2 className="w-4 h-4 text-amber-500 animate-pulse" />
    },
    {
      id: "nav-reports",
      title: "Buka Report Generator & Print Assessment",
      action: () => setTab(AppTab.REPORTS),
      section: "Laporan",
      icon: <FileSpreadsheet className="w-4 h-4 text-pink-400" />
    },
    {
      id: "new-patient",
      title: "Buat File Pasien Baru",
      shortcut: "Ctrl+M",
      action: () => {
        const name = prompt("Masukkan nama lengkap pasien:");
        if (name) {
          createNewProject(`${name} - Diet Baru`, name);
        }
      },
      section: "Pasien",
      icon: <Users className="w-4 h-4 text-sky-400" />
    },
    {
      id: "import-sample",
      title: "Muat Studi Kasus Diabetes (Sample)",
      action: () => importSampleProject(),
      section: "Power Tools",
      icon: <Terminal className="w-4 h-4 text-amber-400" />
    }
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.section.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group commands by section for visualization
  const sections: Record<string, CommandItem[]> = {};
  filtered.forEach((cmd) => {
    if (!sections[cmd.section]) {
      sections[cmd.section] = [];
    }
    sections[cmd.section].push(cmd);
  });

  // Flat list coordinates to match selectedIndex
  let flatIndexCounter = 0;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 z-[100] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#121212] border border-[#27272a] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header bar */}
        <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-[#27272a] bg-[#0d0d0d]">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik perintah atau navigasi (e.g. spreadsheet, pasien, optimizer)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-zinc-500"
          />
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono font-bold">
            ESC
          </span>
        </div>

        {/* Command list results */}
        <div className="max-h-[320px] overflow-y-auto p-2 space-y-3 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
              <ShieldAlert className="w-5 h-5 text-zinc-600" />
              <span>Tidak ada perintah yang sesuai.</span>
            </div>
          ) : (
            Object.entries(sections).map(([sectionName, items]) => (
              <div key={sectionName} className="space-y-1">
                <h4 className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 uppercase px-2 py-1">
                  {sectionName}
                </h4>
                <div className="space-y-0.5">
                  {items.map((cmd) => {
                    const currentFlatIndex = flatIndexCounter++;
                    const isSelected = currentFlatIndex === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-zinc-800 text-white" 
                            : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded ${isSelected ? "bg-zinc-900 text-[#00d4ff]" : "bg-zinc-950 text-zinc-400"}`}>
                            {cmd.icon}
                          </div>
                          <span className="text-xs font-medium">{cmd.title}</span>
                        </div>
                        {cmd.shortcut ? (
                          <kbd className="text-[9px] font-mono bg-zinc-950 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
                            {cmd.shortcut}
                          </kbd>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom hotkeys cheat-sheet */}
        <div className="bg-[#09090b] px-4 py-2 border-t border-[#27272a] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center space-x-3">
            <span>↑↓ untuk memilih</span>
            <span>↵ untuk menjalankan</span>
          </div>
          <span>Clinical Commander v1.0</span>
        </div>
      </div>
    </div>
  );
}
