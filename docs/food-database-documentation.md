# 🇮🇩 DATABASE MAKANAN INDONESIA ULTRA LENGKAP - DOKUMENTASI
## "TIDAK ADA YANG TERTINGGAL" EDITION

---

## 🎯 PENDAHULUAN
Dokumen ini mendokumentasikan perluasan basis data gizi makanan khas Indonesia yang terintegrasi penuh dalam aplikasi **Nutri-Intelligence Platform**. Database ini dirancang khusus untuk menyelaraskan klasifikasi klinis gizi lokal dengan standar internasional (seperti USDA, BLS, FAO), mencakup lebih dari **3,000+ item makanan** dari 34 provinsi dan berbagai metode pengolahan tradisional.

---

## 📊 CAKUPAN DATABASE & DISTRIBUSI SEKTOR
Database ini didistribusikan secara proporsional ke dalam kategori gizi utama sebagai berikut:

| Sektor Klasifikasi | Target Jumlah Item | File Sumber Data |
| :--- | :---: | :--- |
| **A. Makanan Pokok** | 400 Items | `src/data/indonesian-foods-complete.ts` |
| **B. Lauk Pauk Hewani** | 600 Items | `src/data/indonesian-foods-complete.ts` |
| **C. Lauk Pauk Nabati** | 250 Items | `src/data/indonesian-foods-complete.ts` |
| **D. Sayuran** | 400 Items | `src/data/indonesian-foods-complete.ts` |
| **E. Buah-buahan** | 400 Items | `src/data/indonesian-foods-complete.ts` |
| **F. Minuman Tradisional** | 250 Items | `src/data/beverages-complete.ts` |
| **G. Makanan Olahan & Jajanan** | 500 Items | `src/data/traditional-snacks-complete.ts` / `street-foods.ts` |
| **H. Bumbu, Rempah & Pelengkap**| 200 Items | `src/data/spices-complete.ts` |
| **TOTAL** | **3,000+ ITEMS** | |

---

## 🔬 STRUKTUR SCHEMA DATA (`IndonesianFood` / `FoodItem`)
Setiap data makanan mengimplementasikan struktur terperinci berikut untuk mengakomodasi kebutuhan gizi klinis presisi:

```typescript
interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;                  // per 100g (kcal)
  protein: number;                   // per 100g (g)
  carbs: number;                     // per 100g (g)
  fat: number;                       // per 100g (g)
  fiber: number;                     // per 100g (g)
  sodium: number;                    // per 100g (mg)
  calcium: number;                   // per 100g (mg)
  iron: number;                      // per 100g (mg)
  vitaminC: number;                  // per 100g (mg)
  potassium: number;                 // per 100g (mg)
  magnesium: number;                 // per 100g (mg)
  zinc: number;                      // per 100g (mg)
  folate: number;                    // per 100g (mcg)
  vitaminA: number;                  // per 100g (mcg)
  water: number;                     // per 100g (g)
  sugar: number;                     // per 100g (g)

  // Metrik NutriSurvey Tingkat Lanjut
  price_per_100g?: number;           // IDR
  phytic_acid?: number;              // mg per 100g
  calcium_absorb_factor?: number;    // Bioavailabilitas kalsium (0.0 - 1.0)
  zinc_absorb_factor?: number;       // Bioavailabilitas seng (0.0 - 1.0)
  iron_absorb_factor?: number;       // Bioavailabilitas zat besi (0.0 - 1.0)

  // Atribut Kultural & Tradisional Baru
  culturalSignificance?: string;     // Latar belakang adat/upacara
  seasonality?: string;              // Musiman (tahunan, musiman, selalu ada)
  cookingTime?: number;              // Estimasi waktu masak (menit)
  difficulty?: 'easy' | 'medium' | 'hard';
  ceremonialUse?: string[];          // Penggunaan khusus dalam upacara adat
  medicinalProperties?: string[];    // Sifat obat/terapi gizi
  shelfLifeDays?: number;            // Daya simpan (hari)
  storageMethod?: string;            // Metode penyimpanan terbaik
  allergens?: string[];              // Deteksi zat alergen
}
```

---

## ✅ PROSES VALIDASI DATA GIZI
Seluruh data komposisi pangan diverifikasi menggunakan metode komparasi ganda:
1. **Tabel Komposisi Pangan Indonesia (TKPI)** - Kementerian Kesehatan Republik Indonesia.
2. **USDA FoodData Central** - United States Department of Agriculture.
3. **Jurnal Gizi Klinis IPB / UGM / Universitas Airlangga** untuk verifikasi bioavailabilitas mineral akibat kandungan fitat lokal.
4. **Dinas Ketahanan Pangan Daerah** untuk penentuan bobot porsi lokal tradisional.
