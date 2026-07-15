# 📋 Catatan Rilis (Release Notes) - Nutri-Intelligence Platform

Gunakan dokumen ini untuk mencatat log perubahan (changelog) pada setiap versi rilis sebelum melakukan proses publikasi tag ke GitHub.

---

## [v1.0.0] - Rilis Produksi Utama (Modular & Terintegrasi)

### 🚀 Fitur Baru
- **Integrasi Cloud Sync Supabase**: Sinkronisasi data pasien secara real-time multi-perangkat dengan model Row Level Security (RLS) yang ketat.
- **Tauri Desktop Client**: Dukungan rilis aplikasi desktop untuk Windows (.msi), macOS (.dmg), dan Linux (.deb) melalui satu basis kode tunggal.
- **Pengaman Visual**: Banner status Beta yang dapat ditutup dan modal Disclaimer Gizi/Klinis demi kepatuhan regulasi medis.
- **Sistem Pengingat Interaksi Obat**: Pelacakan interaksi obat-nutrisi langsung di halaman profil medis pasien.
- **Simplex Linear Diet Optimizer**: Penyusun rencana makan otomatis berdasarkan target gizi makro yang presisi.

### 🐛 Perbaikan Bug
- Perbaikan sinkronisasi ID non-UUID dari penyimpanan luring dengan integrasi utilitas hashing UUID deterministik di client-side.
- Perbaikan rendering visual kurva pertumbuhan WHO (KMS) agar responsif pada seluruh resolusi monitor desktop.

### ⚡ Peningkatan Performa
- Kecepatan pemrosesan optimasi diet linear dipersingkat hingga < 10ms menggunakan basis data terkompilasi.
- Kompresi ukuran bundle aplikasi web dan desktop melalui optimasi modul asset static dan code splitting.
