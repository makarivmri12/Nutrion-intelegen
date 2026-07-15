# Nutri-Intelligence Platform (v2.4.0)

> Professional Nutrition Analysis & Linear Programming Diet Optimization Assessment System.

Platform asisten gizi cerdas terpadu yang dirancang khusus untuk asisten gizi, dokter spesialis gizi klinik, serta konsultan kesehatan guna melakukan pencatatan log harian makanan, asupan mikronutrien presisi, kalkulasi BMR/TDEE realtime, dan optimalisasi porsi makan otomatis berbasis Linear Programming (LP Simplex) dan AI Diagnostic (Gemini).

---

## Fitur Utama Platform

-   **Interactive Nutrient Spreadsheet:** Grid sel resep realtime dengan pemetaan porsi presisi dan pemetaan otomatis pangkalan gizi pangan (Indonesian TKPI, USDA, BLS, FAO).
-   **Clinical Patient Directory & BMR:** Panel registrasi profil klinis dengan kalkulator indeks massa tubuh (BMI) otomatis, pengelompokan gizi dasar, dan perbandingan formula BMR (Mifflin-St Jeor, Harris-Benedict, WHO).
-   **LP Diet Optimizer:** Solver matematika simplex linear programming untuk menyusun proporsi porsi optimal makanan guna memenuhi asupan makronutrien target dengan kalori/biaya terendah.
-   **Clinical Analytics Panel:** Dashboard grafik radar gizi makro, grafik batang serapan mikronutrien harian terhadap Angka Kecukupan Gizi (AKG), serta rekomendasi resep subtitusi.
-   **Food Frequency Questionnaire (FFQ) & Diet History:** Evaluasi kualitatif komprehensif asupan pola makan mingguan/bulanan pasien.
-   **Assessment Report Generator:** Cetak dokumen asupan gizi resmi klinis langsung ke dokumen Excel, Word, atau cetak PDF modern.
-   **Data Backup & System Recovery:** Sistem backup mandiri format berkas JSON lokal dan auto-save realtime ke IndexedDB browser setiap 30 detik untuk pencegahan kehilangan data.
-   **Offline-First Support:** Menggunakan Service Worker kustom untuk caching aset statis dan kompatibilitas penuh Progressive Web Application (PWA).
-   **Keyboard Shortcuts & Command Palette:** Navigasi super cepat tanpa mouse dengan pintasan pintas global dan antarmuka Command Palette (Ctrl+K).

---

## Pintasan Keyboard Global (Hotkeys)

| Shortcut | Fungsi Pintasan |
| :--- | :--- |
| **Ctrl + K** | Membuka Command Palette (Sistem Navigasi Cepat) |
| **Ctrl + M** | Membuat File Pasien / Rekam Medis Baru |
| **Ctrl + P** | Membuka Tab Utama Spreadsheet Log Makanan |
| **F1** | Membuka Dokumentasi Bantuan & Pusat Tutorial |
| **ESC** | Menutup modal/dialog aktif secara instan |

---

## Panduan Instalasi Lokal

### Prasyarat System
-   **Node.js 18+** & npm
-   **Rust & Cargo** (Hanya diperlukan jika ingin melakukan build paket biner desktop Tauri)

### Langkah Pemasangan

1.  Clone repositori atau unduh zip aplikasi ini.
2.  Pasang dependensi npm:
    ```bash
    npm install
    ```
3.  Jalankan server pengembangan berbasis Vite + Express:
    ```bash
    npm run dev
    ```
4.  Buka web browser Anda pada alamat: `http://localhost:3000`

### Build untuk Produksi (Web Cloud Run)
```bash
npm run build
npm start
```

---

## Lisensi
Aplikasi ini berlisensi di bawah **MIT License**.
© 2026 Nutri-Intelligence. All rights reserved.
