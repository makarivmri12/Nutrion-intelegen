export interface LMSParams {
  L: number;
  M: number;
  S: number;
}

export interface ZScoreResult {
  waz: number;   // Weight-for-Age Z-score
  haz: number;   // Height-for-Age Z-score
  bmiz: number;  // BMI-for-Age Z-score
  status: {
    waz: string; // Indonesian classification for Weight
    haz: string; // Indonesian classification for Height
    bmiz: string; // Indonesian classification for BMI
  };
  details: {
    wazLabel: string;
    hazLabel: string;
    bmizLabel: string;
  };
  flags: string[];
}

// Landmark values for interpolation of LMS values (0 - 60 months)
const BOYS_LMS = {
  waz: [
    { age: 0, L: 0.3487, M: 3.346, S: 0.1451 },
    { age: 3, L: 0.1345, M: 6.400, S: 0.1265 },
    { age: 6, L: -0.0549, M: 7.900, S: 0.1190 },
    { age: 12, L: -0.1585, M: 9.648, S: 0.1147 },
    { age: 18, L: -0.1985, M: 10.903, S: 0.1132 },
    { age: 24, L: -0.2185, M: 12.152, S: 0.1148 },
    { age: 36, L: -0.2543, M: 14.322, S: 0.1185 },
    { age: 48, L: -0.2798, M: 16.307, S: 0.1239 },
    { age: 60, L: -0.3011, M: 18.252, S: 0.1302 }
  ],
  haz: [
    { age: 0, L: 1.0000, M: 49.88, S: 0.0380 },
    { age: 3, L: 1.0000, M: 61.42, S: 0.0370 },
    { age: 6, L: 1.0000, M: 67.62, S: 0.0360 },
    { age: 12, L: 1.0000, M: 75.68, S: 0.0350 },
    { age: 18, L: 1.0000, M: 81.50, S: 0.0355 },
    { age: 24, L: 1.0000, M: 87.13, S: 0.0360 },
    { age: 36, L: 1.0000, M: 96.12, S: 0.0375 },
    { age: 48, L: 1.0000, M: 103.30, S: 0.0390 },
    { age: 60, L: 1.0000, M: 110.02, S: 0.0405 }
  ],
  bmiz: [
    { age: 0, L: 1.0000, M: 13.41, S: 0.0810 },
    { age: 3, L: 0.7500, M: 16.50, S: 0.0750 },
    { age: 6, L: 0.5500, M: 17.20, S: 0.0710 },
    { age: 12, L: 0.4500, M: 16.82, S: 0.0700 },
    { age: 18, L: 0.3200, M: 16.35, S: 0.0720 },
    { age: 24, L: 0.2200, M: 16.02, S: 0.0750 },
    { age: 36, L: 0.1000, M: 15.65, S: 0.0800 },
    { age: 48, L: -0.0500, M: 15.41, S: 0.0830 },
    { age: 60, L: -0.1200, M: 15.25, S: 0.0860 }
  ]
};

const GIRLS_LMS = {
  waz: [
    { age: 0, L: 0.4349, M: 3.244, S: 0.1412 },
    { age: 3, L: 0.2562, M: 5.805, S: 0.1245 },
    { age: 6, L: 0.0820, M: 7.299, S: 0.1223 },
    { age: 12, L: -0.0611, M: 8.949, S: 0.1194 },
    { age: 18, L: -0.1125, M: 10.203, S: 0.1189 },
    { age: 24, L: -0.1479, M: 11.482, S: 0.1215 },
    { age: 36, L: -0.1983, M: 13.805, S: 0.1274 },
    { age: 48, L: -0.2319, M: 15.952, S: 0.1350 },
    { age: 60, L: -0.2586, M: 18.067, S: 0.1436 }
  ],
  haz: [
    { age: 0, L: 1.0000, M: 49.15, S: 0.0390 },
    { age: 3, L: 1.0000, M: 59.82, S: 0.0380 },
    { age: 6, L: 1.0000, M: 65.73, S: 0.0370 },
    { age: 12, L: 1.0000, M: 73.97, S: 0.0360 },
    { age: 18, L: 1.0000, M: 80.02, S: 0.0365 },
    { age: 24, L: 1.0000, M: 85.66, S: 0.0375 },
    { age: 36, L: 1.0000, M: 95.11, S: 0.0390 },
    { age: 48, L: 1.0000, M: 102.70, S: 0.0405 },
    { age: 60, L: 1.0000, M: 109.42, S: 0.0420 }
  ],
  bmiz: [
    { age: 0, L: 1.0000, M: 13.25, S: 0.0820 },
    { age: 3, L: 0.7800, M: 16.20, S: 0.0760 },
    { age: 6, L: 0.5800, M: 16.85, S: 0.0720 },
    { age: 12, L: 0.4800, M: 16.48, S: 0.0710 },
    { age: 18, L: 0.3500, M: 16.05, S: 0.0730 },
    { age: 24, L: 0.2400, M: 15.75, S: 0.0760 },
    { age: 36, L: 0.1200, M: 15.42, S: 0.0810 },
    { age: 48, L: -0.0200, M: 15.22, S: 0.0850 },
    { age: 60, L: -0.0900, M: 15.08, S: 0.0880 }
  ]
};

// Simple helper to interpolate LMS parameters based on age in months
function getInterpolatedLMS(ageMonths: number, table: { age: number, L: number, M: number, S: number }[]): LMSParams {
  const cappedAge = Math.max(0, Math.min(60, ageMonths));
  
  // Find surrounding landmark values
  let lower = table[0];
  let upper = table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    if (cappedAge >= table[i].age && cappedAge <= table[i+1].age) {
      lower = table[i];
      upper = table[i+1];
      break;
    }
  }

  if (lower.age === upper.age) {
    return { L: lower.L, M: lower.M, S: lower.S };
  }

  // Linear interpolation formula: y = y0 + (x - x0) * (y1 - y0) / (x1 - x0)
  const ratio = (cappedAge - lower.age) / (upper.age - lower.age);
  return {
    L: lower.L + ratio * (upper.L - lower.L),
    M: lower.M + ratio * (upper.M - lower.M),
    S: lower.S + ratio * (upper.S - lower.S)
  };
}

// Core WHO Z-score formula
export function computeZScore(value: number, lms: LMSParams): number {
  const { L, M, S } = lms;
  if (value <= 0 || M <= 0) return 0;
  
  let z: number;
  if (Math.abs(L) > 0.001) {
    z = (Math.pow(value / M, L) - 1.0) / (L * S);
  } else {
    z = Math.log(value / M) / S;
  }
  
  // Cap extreme values to prevent formula overflow artifacts
  return Number(Math.max(-5, Math.min(5, z)).toFixed(2));
}

// Calculate the full suite of growth indices
export function calculatePediatricZScores(
  ageMonths: number,
  gender: "Male" | "Female",
  weightKg: number,
  heightCm: number
): ZScoreResult {
  const table = gender === "Male" ? BOYS_LMS : GIRLS_LMS;
  
  // Compute individual factors
  const wazLms = getInterpolatedLMS(ageMonths, table.waz);
  const hazLms = getInterpolatedLMS(ageMonths, table.haz);
  
  const waz = computeZScore(weightKg, wazLms);
  const haz = computeZScore(heightCm, hazLms);
  
  // BMI-for-Age calculation
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmizLms = getInterpolatedLMS(ageMonths, table.bmiz);
  const bmiz = computeZScore(bmi, bmizLms);

  // Kemenkes RI / WHO Classifications
  let wazStatus = "Gizi Baik (Normal)";
  let wazLabel = "Berat badan normal sesuai umur anak.";
  if (waz < -3) {
    wazStatus = "Gizi Buruk (Severely Underweight)";
    wazLabel = "Kekurangan gizi tingkat berat. Butuh asupan nutrisi terapeutik F-75 / F-100.";
  } else if (waz < -2) {
    wazStatus = "Gizi Kurang (Underweight)";
    wazLabel = "Kekurangan gizi sedang. Membutuhkan intervensi protein hewani lokal.";
  } else if (waz > 2) {
    wazStatus = "Risiko Gizi Lebih (Overweight)";
    wazLabel = "Risiko berat badan lebih. Kurangi makanan manis, dorong aktivitas fisik.";
  }

  let hazStatus = "Normal";
  let hazLabel = "Tinggi badan ideal untuk usianya.";
  if (haz < -3) {
    hazStatus = "Sangat Pendek (Severely Stunted)";
    hazLabel = "Stunting berat. Defisit tinggi kronis akibat kurang asupan gizi mikro panjang.";
  } else if (haz < -2) {
    hazStatus = "Pendek (Stunted)";
    hazLabel = "Stunting terdeteksi. Optimalkan bioavailabilitas zat besi dan kalsium.";
  } else if (haz > 2) {
    hazStatus = "Tinggi (Tall)";
    hazLabel = "Pertumbuhan tinggi di atas rata-rata kelompok sebayanya.";
  }

  let bmizStatus = "Normal";
  let bmizLabel = "Rasio massa tubuh terhadap tinggi ideal.";
  if (bmiz < -3) {
    bmizStatus = "Sangat Kurus (Severely Wasted)";
    bmizLabel = "Mengindikasikan wasting berat. Memerlukan penanganan medis segera.";
  } else if (bmiz < -2) {
    bmizStatus = "Kurus (Wasted)";
    bmizLabel = "Kurang asupan gizi akut. Memerlukan porsi makanan padat kalori.";
  } else if (bmiz > 2) {
    bmizStatus = "Gemuk (Overweight)";
    bmizLabel = "Kelebihan berat badan akut dibanding proporsi tinggi badan.";
  } else if (bmiz > 3) {
    bmizStatus = "Obesitas (Obese)";
    bmizLabel = "Obesitas anak. Perlu restrukturisasi diet makro dan mikro komprehensif.";
  }

  // Clinical alerts and red flags
  const flags: string[] = [];
  if (waz < -2) flags.push("Peringatan: Berat badan anak berada di bawah ambang batas normal (Underweight).");
  if (haz < -2) flags.push("Risiko Stunting: Pertumbuhan tinggi badan terhambat (Stunted). Tingkatkan asupan Zn, Ca, Fe.");
  if (bmiz < -2) flags.push("Bahaya Wasting: Kondisi anak sangat kurus, risiko infeksi akut meningkat.");
  if (bmiz > 2) flags.push("Risiko Obesitas Anak: Kurangi kalori kosong dari minuman manis.");

  return {
    waz,
    haz,
    bmiz,
    status: {
      waz: wazStatus,
      haz: hazStatus,
      bmiz: bmizStatus
    },
    details: {
      wazLabel,
      hazLabel,
      bmizLabel
    },
    flags
  };
}
