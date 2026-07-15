import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function BetaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Periksa apakah pengguna telah menutup banner ini sebelumnya
    const isDismissed = localStorage.getItem("beta_banner_dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("beta_banner_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      id="beta-banner-container"
      className="fixed top-0 left-0 right-0 z-[200] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black py-2 px-4 shadow-md flex items-center justify-between text-xs font-medium border-b border-amber-400/20"
    >
      <div className="flex-1 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
        </span>
        <span>
          <strong>🚧 Versi Beta</strong> - Masih dalam uji coba publik. Seluruh fitur dapat mengalami pembaruan berkala.
        </span>
      </div>
      <button
        id="dismiss-beta-banner"
        onClick={handleDismiss}
        className="p-1 hover:bg-black/10 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-black"
        aria-label="Tutup Banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
