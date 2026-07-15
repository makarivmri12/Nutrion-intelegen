import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function HealthDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Cek apakah disclaimer sudah pernah diterima
    const isAccepted = localStorage.getItem("disclaimer_accepted");
    if (!isAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="health-disclaimer-overlay"
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div 
        id="health-disclaimer-modal"
        className="w-full max-w-md bg-[#121212] border border-amber-500/30 rounded-xl shadow-2xl p-6 space-y-6 text-center animate-scale-up"
      >
        <div className="flex justify-center">
          <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20">
            <AlertTriangle className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Pemberitahuan & Sanggahan Medis
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            ⚠️ Aplikasi ini dirancang untuk mendukung pelacakan nutrisi umum, asuhan gizi mandiri, dan asisten keputusan klinis modular.
            <span className="block mt-2 font-medium text-amber-200">
              Hasil analisis dari platform ini bukan merupakan pengganti saran medis, diagnosis, atau terapi medis profesional.
            </span>
          </p>
        </div>

        <div className="pt-2">
          <button
            id="accept-disclaimer-btn"
            onClick={handleAccept}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Saya Mengerti & Setuju
          </button>
        </div>
      </div>
    </div>
  );
}
