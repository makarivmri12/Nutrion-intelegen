export interface ExchangeFood {
  name: string;
  portionDescription: string;  // e.g., '1 centong', '1 potong sedang', '2 sdm'
  weightGrams: number;
}

export interface ExchangeGroup {
  groupName: string;         // 'Nasi & Pengganti', 'Protein Hewani', etc.
  portionSize: string;       // e.g., '1 porsi = ¾ gelas (100g)'
  caloriesPerPortion: number;
  proteinPerPortion: number;
  fatPerPortion: number;
  carbsPerPortion: number;
  // Duplicate properties to support both standard and flat-named fields for robustness
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  foods: ExchangeFood[];
}

export const indonesianExchangeLists: ExchangeGroup[] = [
  {
    groupName: 'Nasi & Pengganti (Karbohidrat)',
    portionSize: '1 porsi = ¾ gelas (100g nasi)',
    caloriesPerPortion: 175,
    proteinPerPortion: 4,
    fatPerPortion: 0,
    carbsPerPortion: 40,
    calories: 175,
    protein: 4,
    fat: 0,
    carbs: 40,
    foods: [
      { name: 'Nasi Putih', portionDescription: '¾ gelas (1 centong)', weightGrams: 100 },
      { name: 'Nasi Merah', portionDescription: '¾ gelas (1 centong)', weightGrams: 100 },
      { name: 'Ubi Cilembu Bakar', portionDescription: '1 buah sedang', weightGrams: 135 },
      { name: 'Singkong Rebus', portionDescription: '1 potong sedang', weightGrams: 120 },
      { name: 'Roti Tawar Gandum', portionDescription: '2 lembar', weightGrams: 60 },
      { name: 'Mie Basah / Kuning', portionDescription: '1 gelas', weightGrams: 150 },
      { name: 'Kentang Kukus', portionDescription: '2 buah sedang', weightGrams: 200 },
      { name: 'Jagung Manis Pipil', portionDescription: '1 gelas', weightGrams: 150 },
      { name: 'Bihun Matang', portionDescription: '1 gelas', weightGrams: 150 },
      { name: 'Bubur Beras', portionDescription: '2 gelas', weightGrams: 400 },
      { name: 'Talas Bogor Kukus', portionDescription: '1 buah sedang', weightGrams: 120 },
      { name: 'Macaroni Matang', portionDescription: '½ gelas', weightGrams: 50 },
      { name: 'Tape Singkong', portionDescription: '1 potong sedang', weightGrams: 100 },
      { name: 'Krakers Asin', portionDescription: '5 buah sedang', weightGrams: 50 },
      { name: 'Havermout (Oatmeal)', portionDescription: '4 sendok makan', weightGrams: 45 }
    ]
  },
  {
    groupName: 'Protein Hewani',
    portionSize: '1 porsi = 1 potong sedang (40g daging)',
    caloriesPerPortion: 75,
    proteinPerPortion: 7,
    fatPerPortion: 5,
    carbsPerPortion: 0,
    calories: 75,
    protein: 7,
    fat: 5,
    carbs: 0,
    foods: [
      { name: 'Daging Sapi Has Dalam', portionDescription: '1 potong sedang', weightGrams: 35 },
      { name: 'Telur Ayam Kampung', portionDescription: '1 butir utuh', weightGrams: 55 },
      { name: 'Ayam Tanpa Kulit', portionDescription: '1 potong sedang', weightGrams: 40 },
      { name: 'Ikan Kakap / Tuna', portionDescription: '1 potong sedang', weightGrams: 40 },
      { name: 'Ikan Mas / Lele', portionDescription: '1 potong sedang', weightGrams: 45 },
      { name: 'Putih Telur Ayam', portionDescription: '2.5 butir', weightGrams: 75 },
      { name: 'Udang Segar', portionDescription: '5 ekor sedang', weightGrams: 40 },
      { name: 'Cumi-Cumi', portionDescription: '1 ekor sedang', weightGrams: 45 },
      { name: 'Bakso Sapi', portionDescription: '5 biji sedang', weightGrams: 50 },
      { name: 'Hati Ayam Kampung', portionDescription: '1 pasang', weightGrams: 30 },
      { name: 'Daging Kambing', portionDescription: '1 potong sedang', weightGrams: 40 },
      { name: 'Telur Puyuh', portionDescription: '5 butir', weightGrams: 50 },
      { name: 'Ikan Teri Kering', portionDescription: '1 sendok makan', weightGrams: 15 },
      { name: 'Daging Bebek Tanpa Kulit', portionDescription: '1 potong sedang', weightGrams: 45 },
      { name: 'Kepiting (Daging)', portionDescription: '⅓ gelas', weightGrams: 50 }
    ]
  },
  {
    groupName: 'Protein Nabati',
    portionSize: '1 porsi = 1-2 potong sedang',
    caloriesPerPortion: 75,
    proteinPerPortion: 5,
    fatPerPortion: 3,
    carbsPerPortion: 7,
    calories: 75,
    protein: 5,
    fat: 3,
    carbs: 7,
    foods: [
      { name: 'Tempe Kedelai', portionDescription: '2 potong sedang', weightGrams: 50 },
      { name: 'Tahu Putih Sutra', portionDescription: '1 buah besar', weightGrams: 110 },
      { name: 'Kacang Hijau Kering', portionDescription: '2 sendok makan', weightGrams: 20 },
      { name: 'Kacang Merah Kukus', portionDescription: '2 sdm', weightGrams: 20 },
      { name: 'Kacang Tanah Kupas', portionDescription: '2 sdm', weightGrams: 15 },
      { name: 'Oncom Mentah', portionDescription: '2 potong sedang', weightGrams: 40 },
      { name: 'Kacang Kedelai Rebus', portionDescription: '2.5 sdm', weightGrams: 25 },
      { name: 'Sari Kedelai Murni', portionDescription: '1 gelas (200ml)', weightGrams: 200 },
      { name: 'Kacang Mete Panggang', portionDescription: '1.5 sdm', weightGrams: 15 },
      { name: 'Tahu Sumedang', portionDescription: '3 buah sedang', weightGrams: 50 },
      { name: 'Kembang Tahu', portionDescription: '1 lembar sedang', weightGrams: 20 },
      { name: 'Kacang Polong Kukus', portionDescription: '2.5 sdm', weightGrams: 25 },
      { name: 'Ampas Tahu', portionDescription: '½ gelas', weightGrams: 100 },
      { name: 'Selai Kacang Tanah', portionDescription: '1 sendok makan', weightGrams: 15 },
      { name: 'Kacang Bogor Rebus', portionDescription: '2 sdm', weightGrams: 20 }
    ]
  },
  {
    groupName: 'Sayuran',
    portionSize: '1 porsi = 1 gelas sayur matang (100g)',
    caloriesPerPortion: 25,
    proteinPerPortion: 1,
    fatPerPortion: 0,
    carbsPerPortion: 5,
    calories: 25,
    protein: 1,
    fat: 0,
    carbs: 5,
    foods: [
      { name: 'Bayam Hijau Rebus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Kangkung Kukus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Wortel Iris Matang', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Labu Siam Rebus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Terong Lalap', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Sawi Hijau / Putih', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Kacang Panjang', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Ketimun Segar', portionDescription: 'Bebas dimakan', weightGrams: 100 },
      { name: 'Tomat Merah Segar', portionDescription: 'Bebas dimakan', weightGrams: 100 },
      { name: 'Kol / Kubis Rebus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Buncis Potong Rebus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Brokoli Kukus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Daun Singkong Rebus', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Kembang Kol', portionDescription: '1 gelas sayur', weightGrams: 100 },
      { name: 'Rebung Rebus', portionDescription: '1 gelas sayur', weightGrams: 100 }
    ]
  },
  {
    groupName: 'Buah',
    portionSize: '1 porsi = 1 potong sedang',
    caloriesPerPortion: 50,
    proteinPerPortion: 0,
    fatPerPortion: 0,
    carbsPerPortion: 12,
    calories: 50,
    protein: 0,
    fat: 0,
    carbs: 12,
    foods: [
      { name: 'Pisang Ambon', portionDescription: '1 buah sedang', weightGrams: 50 },
      { name: 'Pepaya Matang', portionDescription: '1 potong besar', weightGrams: 110 },
      { name: 'Jeruk Manis', portionDescription: '2 buah sedang', weightGrams: 110 },
      { name: 'Mangga Harum Manis', portionDescription: '½ buah besar', weightGrams: 90 },
      { name: 'Apel Merah', portionDescription: '1 buah kecil', weightGrams: 85 },
      { name: 'Semangka Merah', portionDescription: '1 potong besar', weightGrams: 150 },
      { name: 'Melon Hijau', portionDescription: '1 potong besar', weightGrams: 150 },
      { name: 'Nanas Madu', portionDescription: '¼ buah sedang', weightGrams: 95 },
      { name: 'Alpukat Mentega', portionDescription: '½ buah sedang', weightGrams: 60 },
      { name: 'Belimbing Manis', portionDescription: '1 buah besar', weightGrams: 125 },
      { name: 'Jambu Biji Merah', portionDescription: '1 buah sedang', weightGrams: 100 },
      { name: 'Rambutan Segar', portionDescription: '8 buah', weightGrams: 75 },
      { name: 'Salak Pondoh', portionDescription: '2 buah sedang', weightGrams: 65 },
      { name: 'Sawo Manis', portionDescription: '1 buah sedang', weightGrams: 55 },
      { name: 'Kurma Kering', portionDescription: '3 buah', weightGrams: 15 }
    ]
  },
  {
    groupName: 'Susu & Olahan',
    portionSize: '1 porsi = 1 gelas (200ml)',
    caloriesPerPortion: 120,
    proteinPerPortion: 7,
    fatPerPortion: 6,
    carbsPerPortion: 10,
    calories: 120,
    protein: 7,
    fat: 6,
    carbs: 10,
    foods: [
      { name: 'Susu Sapi Segar Murni', portionDescription: '1 gelas (200ml)', weightGrams: 200 },
      { name: 'Yoghurt Plain Tanpa Rasa', portionDescription: '1 mangkok / cup', weightGrams: 150 },
      { name: 'Keju Cheddar Lembaran', portionDescription: '1 potong tunggal', weightGrams: 35 },
      { name: 'Susu Kambing Etawa', portionDescription: '¾ gelas', weightGrams: 150 },
      { name: 'Susu Bubuk Full Cream', portionDescription: '4 sendok makan', weightGrams: 25 },
      { name: 'Susu Bubuk Skim', portionDescription: '4 sendok makan', weightGrams: 20 },
      { name: 'Susu Evaporasi', portionDescription: '½ gelas', weightGrams: 100 },
      { name: 'Keju Slice Melted', portionDescription: '1.5 lembar', weightGrams: 35 },
      { name: 'Susu Kental Manis', portionDescription: '2.5 sdm', weightGrams: 30 },
      { name: 'Yakult / Minuman Probiotik', portionDescription: '2 botol', weightGrams: 130 },
      { name: 'Milkshake Vanila', portionDescription: '½ gelas', weightGrams: 100 },
      { name: 'Whipping Cream', portionDescription: '2 sdm', weightGrams: 30 }
    ]
  },
  {
    groupName: 'Minyak & Lemak',
    portionSize: '1 porsi = 1 sendok teh (5g)',
    caloriesPerPortion: 50,
    proteinPerPortion: 0,
    fatPerPortion: 5,
    carbsPerPortion: 0,
    calories: 50,
    protein: 0,
    fat: 5,
    carbs: 0,
    foods: [
      { name: 'Minyak Goreng Sawit', portionDescription: '1 sendok teh', weightGrams: 5 },
      { name: 'Margarin / Mentega', portionDescription: '1 sdt', weightGrams: 5 },
      { name: 'Santan Kelapa Encer', portionDescription: '½ gelas', weightGrams: 100 },
      { name: 'Santan Kelapa Kental', portionDescription: '2 sendok makan', weightGrams: 30 },
      { name: 'Minyak Zaitun (Olive Oil)', portionDescription: '1 sendok teh', weightGrams: 5 },
      { name: 'Mentega Putih (Shortening)', portionDescription: '1 sdt', weightGrams: 5 },
      { name: 'Minyak Jagung', portionDescription: '1 sdt', weightGrams: 5 },
      { name: 'Minyak Wijen', portionDescription: '1 sdt', weightGrams: 5 },
      { name: 'Lemak Sapi (Suet)', portionDescription: '1 potong kecil', weightGrams: 5 },
      { name: 'Lemak Babi (Lard)', portionDescription: '1 sdt', weightGrams: 5 },
      { name: 'Mayones Plain', portionDescription: '1.5 sdt', weightGrams: 10 },
      { name: 'Dressing Salad Wijen Sangrai', portionDescription: '1 sendok makan', weightGrams: 15 }
    ]
  }
];
