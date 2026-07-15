export interface DrugNutrientInteraction {
  id: string;
  drugName: string;
  drugClass: string;
  nutrient: string;
  interactionType: 'decreases_absorption' | 'increases_excretion' | 'alters_metabolism' | 'enhances_effect' | 'antagonizes' | 'depletes_nutrient';
  severity: 'mild' | 'moderate' | 'severe';
  mechanism: string;
  recommendation: string;
  timingAdvice: string;
  evidenceLevel: 'A' | 'B' | 'C';
}

export const drugNutrientInteractions: DrugNutrientInteraction[] = [
  // 1. Antikoagulan (Warfarin & Coumarin derivatives)
  {
    id: 'dni_1',
    drugName: 'Warfarin (Simarc)',
    drugClass: 'Antikoagulan',
    nutrient: 'Vitamin K',
    interactionType: 'antagonizes',
    severity: 'severe',
    mechanism: 'Vitamin K merangsang sintesis faktor pembekuan darah di hati, yang secara langsung meniadakan kerja inhibisi warfarin pada siklus epoksida reduktase.',
    recommendation: 'Konsumsi sayuran berdaun hijau gelap (bayam, kangkung, brokoli) dalam porsi yang stabil dan konsisten setiap hari. Hindari perubahan drastis dalam asupan.',
    timingAdvice: 'Pertahankan asupan harian yang konstan. Jangan melakukan diet ketat sayuran hijau secara mendadak.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_2',
    drugName: 'Coumarin',
    drugClass: 'Antikoagulan',
    nutrient: 'Vitamin K',
    interactionType: 'antagonizes',
    severity: 'severe',
    mechanism: 'Mekanisme serupa dengan warfarin, menghambat sintesis faktor koagulasi dependen-Vitamin K (II, VII, IX, X).',
    recommendation: 'Jaga porsi asupan sayur hijau, kedelai, dan teh hijau tetap konsisten untuk mencegah fluktuasi nilai INR (International Normalized Ratio).',
    timingAdvice: 'Diskusikan dengan ahli gizi untuk menu mingguan yang stabil kadar Vitamin K-nya.',
    evidenceLevel: 'A'
  },

  // 2. Antibiotik Tetracycline & Quinolone (Chelating agents)
  {
    id: 'dni_3',
    drugName: 'Tetracycline',
    drugClass: 'Antibiotik Tetracycline',
    nutrient: 'Kalsium (Susu & Produk Susu)',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Tetracycline berikatan kovalen koordinat dengan ion Kalsium (Ca2+) membentuk kompleks khelat tidak larut dalam lumen usus, menurunkan absorpsi antibiotik hingga >60%.',
    recommendation: 'Hindari konsumsi susu, yogurt, keju, atau custard secara bersamaan dengan meminum obat.',
    timingAdvice: 'Minum obat 2 jam sebelum atau 4 jam setelah mengonsumsi produk susu atau turunan kalsium.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_4',
    drugName: 'Doxycycline',
    drugClass: 'Antibiotik Tetracycline',
    nutrient: 'Zat Besi (Fe)',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Ion besi membentuk khelat kompleks stabil dengan doxycycline, menghambat penyerapannya secara signifikan di usus halus.',
    recommendation: 'Hindari suplemen zat besi, multivitamin dengan mineral, dan bayam dosis tinggi berdekatan dengan jam minum obat.',
    timingAdvice: 'Beri jarak minimal 2 jam sebelum atau 3 jam setelah minum obat.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_5',
    drugName: 'Minocycline',
    drugClass: 'Antibiotik Tetracycline',
    nutrient: 'Magnesium',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Magnesium dalam makanan atau antasida membentuk ikatan kompleks khelat tidak larut dengan molekul minocycline di lambung.',
    recommendation: 'Jangan konsumsi suplemen magnesium atau antasida yang mengandung magnesium berdekatan dengan jam minum minocycline.',
    timingAdvice: 'Pisahkan konsumsi magnesium minimal 2 jam setelah minum obat.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_6',
    drugName: 'Ciprofloxacin (Baquinor)',
    drugClass: 'Antibiotik Quinolone',
    nutrient: 'Kalsium (Susu)',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Ciprofloxacin mengalami adsorpsi fisik dan pengkhelatan oleh kation divalen Ca2+, memangkas bioavailabilitas obat di sirkulasi sistemik.',
    recommendation: 'Hindari minum susu segar, susu almond, jus diperkaya kalsium, atau yoghurt bersama ciprofloxacin.',
    timingAdvice: 'Konsumsi obat 2 jam sebelum atau 6 jam setelah asupan makanan tinggi kalsium.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_7',
    drugName: 'Levofloxacin (Cravit)',
    drugClass: 'Antibiotik Quinolone',
    nutrient: 'Seng (Zinc)',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Ikatan khelat terbentuk antara kation seng divalen dengan gugus karboksil dan keton dari levofloxacin di saluran cerna.',
    recommendation: 'Tunda minum suplemen seng bebas atau zinc picolinate selama memakan levofloxacin.',
    timingAdvice: 'Minum suplemen seng minimal 2 jam setelah atau 4 jam sebelum minum obat.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_8',
    drugName: 'Ofloxacin',
    drugClass: 'Antibiotik Quinolone',
    nutrient: 'Zat Besi (Fe)',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Ofloxacin berikatan dengan zat besi dalam lambung, menghasilkan endapan yang tidak dapat diabsorpsi oleh mukosa duodenum.',
    recommendation: 'Hindari konsumsi bersamaan dengan suplemen zat besi (Sangobion, dll) atau makanan sangat kaya besi heme.',
    timingAdvice: 'Pisahkan konsumsi minimal 2 jam setelah minum obat.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_9',
    drugName: 'Moxifloxacin',
    drugClass: 'Antibiotik Quinolone',
    nutrient: 'Magnesium',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Magnesium murni menghambat pelarutan tablet moxifloxacin, secara drastis mengurangi efektivitas klinis terapi infeksi.',
    recommendation: 'Jangan gunakan obat maag antasida berbasis magnesium hidroksida atau suplemen magnesium laktat bersamaan.',
    timingAdvice: 'Berikan jeda waktu minimum 4 jam.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_10',
    drugName: 'Erythromycin',
    drugClass: 'Antibiotik Makrolida',
    nutrient: 'Makanan Lemak Tinggi',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Makanan berlemak meningkatkan sekresi empedu dan memperlambat pengosongan lambung, menyebabkan degradasi erythromycin base oleh asam lambung.',
    recommendation: 'Minum obat dalam keadaan perut kosong untuk penyerapan terbaik, kecuali timbul keluhan mual yang hebat.',
    timingAdvice: 'Minum obat 1 jam sebelum makan atau dalam kondisi perut kosong (2 jam setelah makan).',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_11',
    drugName: 'Azithromycin',
    drugClass: 'Antibiotik Makrolida',
    nutrient: 'Makanan Padat / Serat Tinggi',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Makanan padat menghalangi laju disolusi azithromycin di lambung, menurunkan konsentrasi puncak plasma hingga 50%.',
    recommendation: 'Disarankan untuk dikonsumsi saat lambung kosong demi memastikan daya bunuh kuman maksimal.',
    timingAdvice: 'Konsumsi 1 jam sebelum makan atau 2 jam setelah makan.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_12',
    drugName: 'Trimethoprim',
    drugClass: 'Antibiotik',
    nutrient: 'Asam Folat (Vitamin B9)',
    interactionType: 'antagonizes',
    severity: 'moderate',
    mechanism: 'Trimethoprim menghambat enzim dihydrofolate reductase mikroba, tetapi pada dosis tinggi juga mengganggu konversi folat aktif manusia.',
    recommendation: 'Pada penggunaan jangka panjang, pantau kadar hemoglobin dan pertimbangkan suplemen asam folat aktif jika terjadi anemia megaloblastik.',
    timingAdvice: 'Konsumsi suplemen folat terpisah beberapa jam dari jam minum trimethoprim.',
    evidenceLevel: 'B'
  },

  // 3. Diuretik (K-wasting vs K-sparing)
  {
    id: 'dni_13',
    drugName: 'Furosemide (Lasix)',
    drugClass: 'Diuretik Loop',
    nutrient: 'Kalium (Potassium)',
    interactionType: 'increases_excretion',
    severity: 'severe',
    mechanism: 'Furosemide memblokir simporter Na-K-2Cl pada thick ascending limb ansa Henle, memicu peningkatan masif ekskresi kalium melalui urin, berisiko hipokalemia.',
    recommendation: 'Sangat disarankan mengonsumsi asupan kaya kalium tinggi seperti pisang, alpukat, air kelapa muda, kentang rebus, atau suplemen kalium.',
    timingAdvice: 'Monitor berkala kadar kalium serum setiap 3 bulan sekali.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_14',
    drugName: 'Hydrochlorothiazide (HCT)',
    drugClass: 'Diuretik Thiazide',
    nutrient: 'Kalium',
    interactionType: 'increases_excretion',
    severity: 'severe',
    mechanism: 'Menghambat reabsorpsi Na-Cl di tubulus distal, meningkatkan beban natrium ke tubulus kolektivus yang dipertukarkan dengan kalium, membuang kalium ke urin.',
    recommendation: 'Konsumsi buah jeruk, pisang emas, kurma, kismis, atau sayur hijau untuk menjaga homeostasis kalium tubuh.',
    timingAdvice: 'Gunakan saat pagi hari, barengi dengan asupan jus buah segar di siang hari.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_15',
    drugName: 'Spironolactone (Aldactone)',
    drugClass: 'Diuretik Hemat Kalium',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'Spironolactone menghambat aksi aldosteron pada nefron distal secara kompetitif, menahan kalium dan membuang natrium, memicu risiko hiperkalemia.',
    recommendation: 'Batasi penggunaan suplemen kalium dosis tinggi, air kelapa muda berlebih, jus buah pekat, atau pengganti garam natrium (salt substitute KCl).',
    timingAdvice: 'Hindari suplemen kalium eksternal kecuali atas resep dokter khusus.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_16',
    drugName: 'Eplerenone',
    drugClass: 'Diuretik Hemat Kalium',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'Blokade selektif pada reseptor mineralokortikoid ginjal memicu retensi kalium serum.',
    recommendation: 'Batasi asupan pisang cavendish dan ubi jalar secara berlebihan dalam satu waktu santap.',
    timingAdvice: 'Lakukan tes elektrolit serum secara berkala.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_17',
    drugName: 'Amiloride',
    drugClass: 'Diuretik Hemat Kalium',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'Menutup saluran natrium epitel (ENaC) di tubulus distal akhir dan duktus koligentes, secara langsung menekan ekskresi kalium.',
    recommendation: 'Hindari suplemen kalium klorida dan kurangi porsi buah kering berkadar kalium pekat.',
    timingAdvice: 'Gunakan sesuai petunjuk dokter, pantau gejala kram otot atau dada berdebar (tanda hiperkalemia).',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_18',
    drugName: 'Triamterene',
    drugClass: 'Diuretik Hemat Kalium',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'Mekanisme penghambatan saluran natrium mirip amiloride, membatasi sekresi kalium ke urin.',
    recommendation: 'Hindari konsumsi multivitamin dosis tinggi yang mengandung kalium.',
    timingAdvice: 'Minum obat setelah makan pagi untuk mengurangi iritasi lambung.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_19',
    drugName: 'Acetazolamide',
    drugClass: 'Diuretik Carbonic Anhydrase Inhibitor',
    nutrient: 'Kalium & Kalsium',
    interactionType: 'increases_excretion',
    severity: 'moderate',
    mechanism: 'Menghambat karbonik anhidrase memicu hilangnya bikarbonat urin yang menarik kalium dan kalsium keluar dari sirkulasi.',
    recommendation: 'Konsumsi kalsium laktat tambahan dan sayur hijau untuk menjaga cadangan mineral tulang dan fungsional otot.',
    timingAdvice: 'Konsumsi suplemen mineral 2 jam terpisah dari jam minum obat kejang/glaukoma ini.',
    evidenceLevel: 'B'
  },

  // 4. Antihipertensi (ACE Inhibitors & ARB - Potassium retention)
  {
    id: 'dni_20',
    drugName: 'Captopril',
    drugClass: 'ACE Inhibitor',
    nutrient: 'Kalium (Potassium)',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Penurunan produksi Angiotensin II menurunkan sintesis aldosteron. Defisit aldosteron mengurangi sekresi kalium urine, meningkatkan kadar kalium plasma.',
    recommendation: 'Batasi penggunaan suplemen kalium, pengganti garam asin diet (potassium chloride), dan kurangi konsumsi air kelapa muda harian.',
    timingAdvice: 'Minum obat dalam kondisi perut kosong (1 jam sebelum makan) karena makanan mengurangi absorpsi captopril.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_21',
    drugName: 'Lisinopril',
    drugClass: 'ACE Inhibitor',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Menghambat pembentukan angiotensin II secara persisten, menurunkan sekresi aldosteron renal dan menyebabkan retensi kalium di sirkulasi darah.',
    recommendation: 'Batasi konsumsi pisang emas, kurma, dan kentang dalam porsi besar sekaligus.',
    timingAdvice: 'Dapat diminum bersama atau tanpa makanan, tetapi pertahankan pola asup yang sama.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_22',
    drugName: 'Enalapril',
    drugClass: 'ACE Inhibitor',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Penurunan aldosteron ginjal menyebabkan ginjal menahan kalium, memicu risiko hiperkalemia terutama pada pasien gangguan fungsi ginjal.',
    recommendation: 'Jangan gunakan produk diet rendah natrium berbasis garam kalium.',
    timingAdvice: 'Minum obat pada waktu yang konsisten setiap harinya.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_23',
    drugName: 'Ramipril',
    drugClass: 'ACE Inhibitor',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Supresi sintesis aldosteron membatasi pembuangan kalium, berpotensi memicu hiperkalemia.',
    recommendation: 'Kurangi porsi harian buah tinggi kalium seperti alpukat mentega dan durian manis.',
    timingAdvice: 'Ambil obat di malam hari sebelum tidur untuk mengontrol tekanan darah nokturnal.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_24',
    drugName: 'Perindopril',
    drugClass: 'ACE Inhibitor',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Menurunkan degradasi bradikinin dan menekan aldosteron, memicu penyimpanan kalium di dalam plasma.',
    recommendation: 'Gunakan garam dapur standar dalam jumlah terbatas saja daripada beralih ke garam kalium.',
    timingAdvice: 'Minum pagi hari sebelum sarapan.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_25',
    drugName: 'Valsartan',
    drugClass: 'Angiotensin Receptor Blocker (ARB)',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Memblokir reseptor Angiotensin II tipe AT1 secara selektif, meniru efek ACE-inhibitor dalam menurunkan aldosteron dan memicu retensi kalium.',
    recommendation: 'Batasi asupan buah pisang, kentang dengan kulit, dan suplemen kalium.',
    timingAdvice: 'Minum secara teratur bersama makanan ringan non-lemak.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_26',
    drugName: 'Candesartan',
    drugClass: 'Angiotensin Receptor Blocker (ARB)',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Menghentikan pengikatan angiotensin II ke reseptornya, membatasi eliminasi kalium di ginjal.',
    recommendation: 'Hindari jus buah pekat dalam kemasan yang diperkaya kalium atau suplemen kesehatan ginjal berkalium.',
    timingAdvice: 'Dapat diminum bersama makanan untuk mengurangi ketidaknyamanan lambung minor.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_27',
    drugName: 'Losartan',
    drugClass: 'Angiotensin Receptor Blocker (ARB)',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Memblokir efek vasokonstriktor dan sekresi aldosteron dari angiotensin II, memicu peningkatan kadar kalium serum.',
    recommendation: 'Lakukan diet rendah kalium moderat jika kadar kalium darah mulai mendekati batas atas (>5.0 mEq/L).',
    timingAdvice: 'Disarankan minum pada waktu yang sama setiap pagi hari.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_28',
    drugName: 'Telmisartan',
    drugClass: 'Angiotensin Receptor Blocker (ARB)',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Blokade reseptor AT1 menekan pelepasan aldosteron, membatasi ekskresi kalium oleh ginjal.',
    recommendation: 'Hindari produk pengganti garam komersial yang bertuliskan "low sodium" karena biasanya mengandung KCl sebagai pengganti NaCl.',
    timingAdvice: 'Ambil obat di pagi hari sebelum beraktivitas.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_29',
    drugName: 'Irbesartan',
    drugClass: 'Angiotensin Receptor Blocker (ARB)',
    nutrient: 'Kalium',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Menurunkan tahanan perifer dan sekresi aldosteron yang memicu akumulasi kalium di cairan ekstraseluler.',
    recommendation: 'Batasi konsumsi buah kiwi, jeruk bali merah, dan sari kurma pekat.',
    timingAdvice: 'Konsumsi secara konsisten setiap harinya.',
    evidenceLevel: 'A'
  },

  // 5. Calcium Channel Blocker (CCB - Grapefruit interactions)
  {
    id: 'dni_30',
    drugName: 'Amlodipine (Norvask)',
    drugClass: 'Calcium Channel Blocker (CCB)',
    nutrient: 'Kalsium / Jus Grapefruit (Jeruk Purut)',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Grapefruit mengandung furanokumarin yang menonaktifkan sitokrom P450 CYP3A4 di usus, meningkatkan kadar amlodipine dalam darah hingga memicu hipotensi berlebih.',
    recommendation: 'Hindari minum jus grapefruit, jeruk limau tebal, atau suplemen kalsium karbonat ultra-dosis bersamaan dengan obat.',
    timingAdvice: 'Konsumsi jus jeruk asam atau suplemen kalsium minimal berpaut 4-6 jam dari jam minum amlodipine.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_31',
    drugName: 'Nifedipine (Adalat)',
    drugClass: 'Calcium Channel Blocker (CCB)',
    nutrient: 'Jus Grapefruit (Jeruk Bali Merah)',
    interactionType: 'alters_metabolism',
    severity: 'severe',
    mechanism: 'Furanokumarin jeruk grapefruit memblokir metabolisme lintas pertama nifedipine oleh enzim CYP3A4 secara permanen, melipatgandakan bioavailabilitas obat secara berbahaya.',
    recommendation: 'Dilarang keras mengonsumsi grapefruit, jus jeruk bali merah segar, atau manisan kulit jeruk asam selama terapi nifedipine.',
    timingAdvice: 'Hindari konsumsi buah jeruk golongan citrus paradisi selama masa pengobatan.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_32',
    drugName: 'Felodipine',
    drugClass: 'Calcium Channel Blocker (CCB)',
    nutrient: 'Jus Grapefruit',
    interactionType: 'alters_metabolism',
    severity: 'severe',
    mechanism: 'Mekanisme supresi CYP3A4 usus oleh flavonoid grapefruit sangat mempengaruhi felodipine karena obat ini memiliki rasio ekstraksi hati yang tinggi.',
    recommendation: 'Hindari konsumsi jeruk bali merah atau suplemen ekstrak grapefruit.',
    timingAdvice: 'Mutlak hindari pencampuran obat ini dengan segala olahan grapefruit.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_33',
    drugName: 'Diltiazem',
    drugClass: 'Calcium Channel Blocker (CCB)',
    nutrient: 'Jus Grapefruit & Kalsium',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Diltiazem dimetabolisme oleh CYP3A4. Supresi enzim oleh grapefruit memicu peningkatan kadar plasma diltiazem, berisiko bradikardia.',
    recommendation: 'Batasi jus buah citrus pekat dan jangan gunakan suplemen kalsium dosis tinggi kecuali diresepkan.',
    timingAdvice: 'Ambil obat saat lambung kosong atau sebelum makan besar.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_34',
    drugName: 'Verapamil',
    drugClass: 'Calcium Channel Blocker (CCB)',
    nutrient: 'Grapefruit & Makanan Tinggi Serat',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Makanan berserat tinggi mengurangi laju disolusi verapamil hidroklorida di lambung, sementara grapefruit menghambat pembersihannya.',
    recommendation: 'Konsumsi makanan berserat sedang, beri jeda jika mengonsumsi suplemen serat oat atau psyllium husk.',
    timingAdvice: 'Minum obat bersama segelas air putih hangat 1 jam sebelum makan serat tinggi.',
    evidenceLevel: 'B'
  },

  // 6. Statin (HMG-CoA Reductase Inhibitors - CoQ10 & Grapefruit)
  {
    id: 'dni_35',
    drugName: 'Atorvastatin',
    drugClass: 'Statin',
    nutrient: 'Coenzyme Q10 (CoQ10) & Grapefruit',
    interactionType: 'depletes_nutrient',
    severity: 'moderate',
    mechanism: 'Atorvastatin menghambat jalur mevalonat yang memblokir koenzim Q10 di otot, memicu miopati. Grapefruit meningkatkan kadar atorvastatin hingga meningkatkan toksisitas otot.',
    recommendation: 'Konsumsi suplemen Coenzyme Q10 (100 mg/hari) untuk meredakan nyeri otot. Hindari asupan buah grapefruit.',
    timingAdvice: 'Gunakan suplemen CoQ10 bersamaan dengan makan pagi atau malam hari.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_36',
    drugName: 'Simvastatin',
    drugClass: 'Statin',
    nutrient: 'Coenzyme Q10 (CoQ10) & Grapefruit',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Simvastatin adalah statin lipofilik yang sangat rentan terhadap hambatan CYP3A4 oleh grapefruit, melipatgandakan risiko rhabdomyolysis akibat penurunan drastis CoQ10 otot.',
    recommendation: 'Wajib menghindari konsumsi jus grapefruit. Dianjurkan minum suplemen CoQ10 harian untuk melindungi otot lurik.',
    timingAdvice: 'Minum simvastatin murni di malam hari sebelum tidur, dan suplemen CoQ10 di siang hari saat makan.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_37',
    drugName: 'Rosuvastatin',
    drugClass: 'Statin',
    nutrient: 'Coenzyme Q10 (CoQ10)',
    interactionType: 'depletes_nutrient',
    severity: 'moderate',
    mechanism: 'Meskipun rosuvastatin tidak menggunakan CYP3A4 untuk eliminasinya, ia tetap menghambat HMG-CoA reduktase yang menurunkan cadangan energi CoQ10 seluler.',
    recommendation: 'Suplementasi CoQ10 dianjurkan jika timbul rasa letih ekstrim atau pegal otot di paha/betis.',
    timingAdvice: 'Bisa dikonsumsi pagi atau malam hari secara konsisten.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_38',
    drugName: 'Lovastatin',
    drugClass: 'Statin',
    nutrient: 'Coenzyme Q10 & Makanan Berlemak',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Penyerapan lovastatin meningkat tajam jika dikonsumsi bersama makanan berlemak, namun biosintesis CoQ10 tetap terdepresiasi.',
    recommendation: 'Konsumsi bersama makanan untuk penyerapan optimal, tetapi imbangi dengan suplementasi CoQ10 pelindung otot.',
    timingAdvice: 'Konsumsi bersamaan dengan makan malam utama.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_39',
    drugName: 'Pravastatin',
    drugClass: 'Statin',
    nutrient: 'Coenzyme Q10',
    interactionType: 'depletes_nutrient',
    severity: 'moderate',
    mechanism: 'Menurunkan biosintesis koenzim Q10 intraseluler meski profil keamanannya terhadap otot lebih ramah dibanding simvastatin.',
    recommendation: 'Tingkatkan asupan makanan kaya CoQ10 seperti jantung sapi, ikan kembung, sarden, atau bayam rebus.',
    timingAdvice: 'Minum malam hari.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_40',
    drugName: 'Fluvastatin',
    drugClass: 'Statin',
    nutrient: 'Coenzyme Q10',
    interactionType: 'depletes_nutrient',
    severity: 'moderate',
    mechanism: 'Katabolisme jalur mevalonat yang terhambat mengurangi cadangan ubiquinone (CoQ10) di otot rangka.',
    recommendation: 'Gunakan suplemen ubiquinol / CoQ10 jika dirasa perlu oleh dokter atau tim gizi.',
    timingAdvice: 'Minum sebelum tidur malam.',
    evidenceLevel: 'C'
  },

  // 7. Antidiabetes Oral & Insulin
  {
    id: 'dni_41',
    drugName: 'Metformin',
    drugClass: 'Antidiabetes Oral (Biguanida)',
    nutrient: 'Vitamin B12',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Metformin merubah kalsium-dependen membran ileum terminal, menghambat ikatan kompleks faktor intrinsik Castle-Vitamin B12 ke reseptor penyerapan.',
    recommendation: 'Pasien dengan terapi metformin jangka panjang (>1-2 tahun) harus memantau kadar hemoglobin dan dianjurkan suplementasi Vitamin B12 aktif.',
    timingAdvice: 'Konsumsi suplemen B12 atau makanan kaya B12 saat makan terpisah jika memungkinkan.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_42',
    drugName: 'Acarbose',
    drugClass: 'Antidiabetes Oral',
    nutrient: 'Karbohidrat Kompleks (Tepung / Pati)',
    interactionType: 'antagonizes',
    severity: 'moderate',
    mechanism: 'Acarbose secara kompetitif menginhibisi alfa-amilase pankreas dan alfa-glukosidase usus halus, memperlambat pemecahan karbohidrat kompleks menjadi glukosa.',
    recommendation: 'Apabila terjadi serangan hipoglikemia, berikan glukosa murni (dekstrosa / madu murni) daripada gula pasir biasa (sukrosa) karena absorpsi sukrosa diblokir oleh acarbose.',
    timingAdvice: 'Wajib dikonsumsi bersama suapan pertama makan besar.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_43',
    drugName: 'Glibenclamide',
    drugClass: 'Antidiabetes Oral (Sulfonilurea)',
    nutrient: 'Karbohidrat Sederhana (Gula / Jus Manis)',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Merangsang sekresi insulin dari sel beta pankreas secara paksa. Konsumsi karbohidrat lambat larut memicu mismatch glukosa, memicu hipoglikemia berat.',
    recommendation: 'Konsumsi makanan berkarbohidrat seimbang tepat waktu setelah minum obat. Selalu bawa permen gula murni jika terjadi lemas mendadak.',
    timingAdvice: 'Minum obat segera 15-30 menit sebelum makan pagi pertama.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_44',
    drugName: 'Glimepiride',
    drugClass: 'Antidiabetes Oral (Sulfonilurea)',
    nutrient: 'Karbohidrat Sederhana',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Memicu pelepasan insulin tanpa mempedulikan kadar glukosa plasma dasar, rentan memicu hipoglikemia jika jam makan diundur.',
    recommendation: 'Jangan melewatkan waktu makan setelah meminum obat glimepiride.',
    timingAdvice: 'Minum obat bersama suapan pertama sarapan pagi.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_45',
    drugName: 'Gliclazide',
    drugClass: 'Antidiabetes Oral (Sulfonilurea)',
    nutrient: 'Karbohidrat',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Mekanisme sulfonilurea generasi kedua, meningkatkan sensitivitas sel beta pankreas terhadap stimulasi glukosa.',
    recommendation: 'Jaga kepatuhan jadwal makan utama dan selingan sehat.',
    timingAdvice: 'Minum sesaat sebelum makan.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_46',
    drugName: 'Pioglitazone',
    drugClass: 'Antidiabetes Oral (Tiazolidindion)',
    nutrient: 'Natrium (Garam)',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Pioglitazone meningkatkan reabsorpsi natrium di tubulus kolektivus ginjal, meningkatkan volume plasma dan memicu edema jika asupan garam tinggi.',
    recommendation: 'Batasi asupan garam, makanan asin, kerupuk, kecap asin, dan MSG tinggi untuk mencegah pembengkakan di kaki.',
    timingAdvice: 'Lakukan diet rendah natrium (<2000 mg natrium/hari).',
    evidenceLevel: 'B'
  },

  // 8. Proton Pump Inhibitors (PPI) & H2 Blockers
  {
    id: 'dni_47',
    drugName: 'Omeprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    nutrient: 'Vitamin B12, Kalsium, Zat Besi, Magnesium',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Achlorhydria menghambat pemisahan Vitamin B12 dari protein makanan dan mengurangi kelarutan garam kalsium karbonat kasar serta zat besi non-heme.',
    recommendation: 'Suplementasi dengan kalsium sitrat (yang tidak membutuhkan suasana asam untuk larut) dan Vitamin B12 sublingual/cair jika konsumsi PPI kronis.',
    timingAdvice: 'Minum suplemen mineral minimal 2 jam setelah atau sebelum mengonsumsi obat lambung ini.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_48',
    drugName: 'Lansoprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    nutrient: 'Zat Besi (Fe) & Kalsium',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Supresi asam klorida lambung mengurangi reduksi Fe3+ menjadi Fe2+ yang mudah diserap usus.',
    recommendation: 'Konsumsi makanan tinggi Vitamin C untuk membantu penyerapan zat besi non-heme, atau gunakan kalsium laktat.',
    timingAdvice: 'Minum obat 30-60 menit sebelum makan pagi.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_49',
    drugName: 'Pantoprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    nutrient: 'Magnesium',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Penggunaan jangka panjang menurunkan transpor aktif magnesium di usus halus melalui modulasi protein TRPM6/7.',
    recommendation: 'Monitor kadar magnesium serum jika menggunakan obat di atas 6 bulan berturut-turut.',
    timingAdvice: 'Konsumsi makanan tinggi magnesium seperti biji labu, bayam, almond terpisah waktu.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_50',
    drugName: 'Esomeprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    nutrient: 'Vitamin B12',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Menurunkan pelepasan kobalamin dari kompleks makanan hewani akibat kelangkaan pepsinogen aktif lambung.',
    recommendation: 'Konsumsi suplemen multivitamin dengan kandungan B12 aktif (methylcobalamin).',
    timingAdvice: 'Gunakan suplemen di siang hari, terpisah dari esomeprazole pagi.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_51',
    drugName: 'Rabeprazole',
    drugClass: 'Proton Pump Inhibitor (PPI)',
    nutrient: 'Zat Besi',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Penurunan keasaman lambung menghambat asimilasi zat besi dari sayur-sayuran.',
    recommendation: 'Konsumsi daging merah tanpa lemak atau hati ayam sebagai sumber besi heme yang penyerapannya kurang dipengaruhi keasaman lambung.',
    timingAdvice: 'Ambil obat pagi hari saat perut kosong.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_52',
    drugName: 'Ranitidine',
    drugClass: 'H2 Receptor Antagonist',
    nutrient: 'Vitamin B12 & Zat Besi',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Blokade histamin H2 mengurangi sekresi cairan asam lambung lambat laun, mengurangi efisiensi absorbsi nutrisi makro/mikro.',
    recommendation: 'Batasi penggunaan antasida pendamping, pastikan asupan protein hewani yang matang lembut mudah cerna.',
    timingAdvice: 'Minum sebelum tidur malam atau sebelum makan makanan pencetus asam.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_53',
    drugName: 'Famotidine',
    drugClass: 'H2 Receptor Antagonist',
    nutrient: 'Kalsium & Magnesium',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Pengurangan asam klorida lambung mengurangi laju disolusi garam kalsium dalam lambung.',
    recommendation: 'Konsumsi sayuran hijau matang dan tahu tempe sebagai alternatif sumber kalsium non-susu.',
    timingAdvice: 'Minum obat 1 jam sebelum makan hidangan berpotensi memicu mual.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_54',
    drugName: 'Cimetidine',
    drugClass: 'H2 Receptor Antagonist',
    nutrient: 'Vitamin D & Zat Besi',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Cimetidine menghambat enzim hidroksilasi vitamin D di hati selain menekan asam lambung untuk besi.',
    recommendation: 'Dianjurkan berjemur sinar matahari pagi dan cek kadar Vitamin D serum secara rutin.',
    timingAdvice: 'Gunakan obat sesudah makan malam.',
    evidenceLevel: 'C'
  },

  // 9. Antikonvulsan / Epilepsi (Folate, Vitamin D, Vitamin K)
  {
    id: 'dni_55',
    drugName: 'Phenytoin',
    drugClass: 'Antikonvulsan',
    nutrient: 'Asam Folat (Vitamin B9), Kalsium, Vitamin D & K',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Phenytoin menginduksi enzim sitokrom P450 di hati, mempercepat katabolisme Vitamin D menjadi tidak aktif, menyebabkan hipokalsemia dan defisiensi folat.',
    recommendation: 'Wajib mengonsumsi suplemen Asam Folat (400-800 mcg) dan Vitamin D3 harian. Lakukan pemeriksaan kepadatan tulang (DEXA) jangka panjang.',
    timingAdvice: 'Berikan jarak minimal 2-3 jam antara suplemen kalsium dan phenytoin karena kalsium menurunkan bioavailabilitas phenytoin.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_56',
    drugName: 'Phenobarbital',
    drugClass: 'Antikonvulsan / Barbiturat',
    nutrient: 'Vitamin D, Kalsium & Asam Folat',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Meningkatkan pembersihan metabolik Vitamin D di hepatosit melalui aktivasi reseptor pregnane X (PXR).',
    recommendation: 'Suplementasi rutin Vitamin D3 (1000-2000 IU) dan konsumsi makanan kaya kalsium tinggi.',
    timingAdvice: 'Pisahkan konsumsi kalsium minimal 3 jam dari phenobarbital.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_57',
    drugName: 'Carbamazepine',
    drugClass: 'Antikonvulsan',
    nutrient: 'Asam Folat, Vitamin D & Jus Grapefruit',
    interactionType: 'alters_metabolism',
    severity: 'severe',
    mechanism: 'Menginduksi degradasi vitamin D secara masif di hati. Konsumsi grapefruit menghambat degradasi carbamazepine sehingga memicu toksisitas obat.',
    recommendation: 'Suplementasi folat dan Vitamin D3 aktif. Dilarang keras memakan grapefruit atau jeruk purut asam.',
    timingAdvice: 'Konsumsi obat bersama makanan untuk mengurangi mual lambung, hindari grapefruit.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_58',
    drugName: 'Valproic Acid',
    drugClass: 'Antikonvulsan',
    nutrient: 'Karnitin (Carnitine), Seng & Selenium',
    interactionType: 'depletes_nutrient',
    severity: 'moderate',
    mechanism: 'Asam valproat berikatan dengan karnitin bebas membentuk valproylcarnitine yang diekskresikan lewat urin, memicu defisiensi karnitin otot.',
    recommendation: 'Disarankan diet tinggi protein hewani (daging sapi, kambing) kaya karnitin alami, atau suplementasi L-carnitine 50-100 mg/kgBB.',
    timingAdvice: 'Minum suplemen karnitin bersama makanan utama.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_59',
    drugName: 'Gabapentin',
    drugClass: 'Antikonvulsan / Neuropati',
    nutrient: 'Kalsium & Magnesium (Antasida)',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Kation divalen dalam antasida berikatan lemah dengan gabapentin, menurunkan laju absorpsinya hingga 20%.',
    recommendation: 'Hindari obat maag cair antasida atau suplemen mineral murni sesaat sebelum meminum gabapentin.',
    timingAdvice: 'Minum gabapentin minimal 2 jam setelah konsumsi antasida atau suplemen mineral divalen.',
    evidenceLevel: 'A'
  },

  // 10. Antiparkinson
  {
    id: 'dni_60',
    drugName: 'Levodopa',
    drugClass: 'Antiparkinson',
    nutrient: 'Protein Tinggi (Asam Amino L-Netral) & Vitamin B6',
    interactionType: 'antagonizes',
    severity: 'severe',
    mechanism: 'Asam amino dari protein bersaing ketat dengan levothyroxine/levodopa menggunakan transporter asam amino netral besar (LAT1) untuk menembus sawar darah otak.',
    recommendation: 'Batasi konsumsi daging pekat atau putih telur sesaat sebelum minum obat. Konsumsi karbohidrat tinggi di siang hari untuk memfasilitasi masuknya asam amino lain ke otot.',
    timingAdvice: 'Minum levodopa minimal 30-45 menit sebelum makan hidangan berprotein tinggi, atau 2 jam setelah makan.',
    evidenceLevel: 'A'
  },

  // 11. Anti-Asma / Bronkodilator
  {
    id: 'dni_61',
    drugName: 'Theophylline',
    drugClass: 'Bronkodilator',
    nutrient: 'Kafein (Kopi, Teh, Coklat) & Protein',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'Kafein dan teofilin adalah derivat metilxantin. Konsumsi bersamaan memicu stimulasi sistem saraf pusat berlebih, aritmia jantung, dan mual hebat.',
    recommendation: 'Hindari kopi, teh pekat, minuman soda berkafein tinggi, coklat bubuk hitam, dan suplemen herba stimulan selama masa pengobatan.',
    timingAdvice: 'Hentikan total konsumsi kafein harian selama meminum obat asma golongan teofilin.',
    evidenceLevel: 'A'
  },

  // 12. NSAID & Analgesik
  {
    id: 'dni_62',
    drugName: 'Ibuprofen',
    drugClass: 'NSAID',
    nutrient: 'Zat Besi (Fe) & Lapisan Lambung',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Ibuprofen menghambat prostaglandin pelindung mukosa lambung, memicu perdarahan lambung mikro yang tidak terasa. Hal ini membuang zat besi sel darah merah.',
    recommendation: 'Hindari konsumsi alkohol, gunakan herba pelindung lambung seperti kunyit, dan penuhi zat besi lewat makanan hewani lunak.',
    timingAdvice: 'Wajib diminum segera setelah makan makanan padat untuk meminimalisir iritasi lokal mukosa lambung.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_63',
    drugName: 'Meloxicam',
    drugClass: 'NSAID',
    nutrient: 'Zat Besi & Sel Darah Merah',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Mirip ibuprofen, meningkatkan risiko erosi lambung kronis lambat yang menurunkan kadar ferritin zat besi di sumsum tulang.',
    recommendation: 'Monitor gejala feses kehitaman atau anemia (lemas, pucat). Lengkapi nutrisi dengan sayur bayam merah dan hati sapi.',
    timingAdvice: 'Minum obat bersama makanan atau susu untuk meminimalisir dispepsia.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_64',
    drugName: 'Diclofenac Sodium',
    drugClass: 'NSAID',
    nutrient: 'Zat Besi',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Iritasi saluran cerna meningkatkan laju kehilangan sel darah merah mikro melalui saluran pembuangan.',
    recommendation: 'Imbangi dengan sayuran tinggi zat besi non-heme dipadukan perasan jeruk lemon segar penunjang absorpsi.',
    timingAdvice: 'Minum tepat setelah makan porsi lengkap.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_65',
    drugName: 'Ketoprofen',
    drugClass: 'NSAID',
    nutrient: 'Zat Besi',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Efek penghambatan COX non-selektif memicu peningkatan risiko iritasi gastrointestinal tersembunyi.',
    recommendation: 'Gunakan pepaya matang atau pisang pelindung alami sesudah minum obat demi kestabilan pencernaan.',
    timingAdvice: 'Konsumsi obat bersama segelas air penuh (240 ml).',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_66',
    drugName: 'Aspirin (Asetosal)',
    drugClass: 'Analgesik / Antiplatelet',
    nutrient: 'Vitamin C, Zat Besi, Asam Folat & Kalium',
    interactionType: 'increases_excretion',
    severity: 'severe',
    mechanism: 'Aspirin berkompetisi dengan Vitamin C di transporter natrium-bikarbonat ginjal, mempercepat sekresi Vitamin C melalui urin hingga 3 kali lipat.',
    recommendation: 'Suplementasi Vitamin C (250-500 mg) dan zat besi untuk mengimbangi pembuangan kation ginjal dan risiko anemia pembekuan.',
    timingAdvice: 'Minum suplemen Vitamin C minimal 4 jam setelah meminum aspirin.',
    evidenceLevel: 'A'
  },

  // 13. Antidepresan (MAOI & SSRI)
  {
    id: 'dni_67',
    drugName: 'Phenelzine',
    drugClass: 'Antidepresan MAOI',
    nutrient: 'Tiramin (Tyramine - Makanan Fermentasi)',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'MAO Inhibitor memblokir degradasi tiramin makanan di usus. Penumpukan tiramin memicu pelepasan norepinefrin hebat, memicu krisis hipertensi.',
    recommendation: 'Dilarang keras mengonsumsi tape ketan/singkong, keju tua, kecap asin fermentasi lama, sosis difermentasi, atau pisang yang terlalu matang (overripe).',
    timingAdvice: 'Terapkan diet ketat bebas tiramin selama masa terapi hingga 2 minggu setelah obat dihentikan.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_68',
    drugName: 'Tranylcypromine',
    drugClass: 'Antidepresan MAOI',
    nutrient: 'Tiramin (Tape / Keju)',
    interactionType: 'enhances_effect',
    severity: 'severe',
    mechanism: 'Hambatan irreversible monoamine oxidase meningkatkan sensitivitas terhadap tiramin makanan vasoaktif secara kritis.',
    recommendation: 'Gunakan bahan makanan segar saja. Jangan memakan lauk sisa kemarin hangat berulang yang tinggi tiramin mikroba.',
    timingAdvice: 'Hindari segala bentuk makanan fermentasi khas Indonesia (terasi, tauco, kecap asin).',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_69',
    drugName: 'Moclobemide',
    drugClass: 'Antidepresan RIMA',
    nutrient: 'Tiramin',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Inhibitor MAO-A reversibel lebih aman, tetapi asupan tiramin dosis raksasa tetap berisiko menaikkan tekanan darah sesaat.',
    recommendation: 'Batasi konsumsi bir bebas alkohol, keju parmesan, dan ragi makanan berlebih.',
    timingAdvice: 'Konsumsi obat segera sesudah makan untuk memperlambat penyerapan tiramin tersisa.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_70',
    drugName: 'Fluoxetine',
    drugClass: 'Antidepresan SSRI',
    nutrient: 'Natrium (Sodium)',
    interactionType: 'increases_excretion',
    severity: 'moderate',
    mechanism: 'Memicu sindrom sekresi hormon antidiuretik yang tidak sesuai (SIADH), membuang natrium tubuh melalui urine secara berlebihan.',
    recommendation: 'Monitor gejala kebingungan, lemas, atau mual (gejala hiponatremia) terutama pada lansia yang mengonsumsi diet sangat rendah garam.',
    timingAdvice: 'Konsumsi sup hangat bergaram cukup atau makanan asin ringan jika direkomendasikan dokter.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_71',
    drugName: 'Sertraline',
    drugClass: 'Antidepresan SSRI',
    nutrient: 'Natrium & Air',
    interactionType: 'increases_excretion',
    severity: 'moderate',
    mechanism: 'SSRI memicu induksi pelepasan ADH di hipofisis yang menahan air secara berlebih dan mengencerkan natrium plasma.',
    recommendation: 'Penuhi asupan cairan secukupnya (tidak berlebih-lebih) dan pastikan makanan mengandung natrium yang seimbang.',
    timingAdvice: 'Minum obat bersama sarapan pagi secara konsisten.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_72',
    drugName: 'Escitalopram',
    drugClass: 'Antidepresan SSRI',
    nutrient: 'Natrium',
    interactionType: 'increases_excretion',
    severity: 'moderate',
    mechanism: 'SIADH yang dipicu escitalopram menurunkan osmolaritas plasma dan membuang natrium.',
    recommendation: 'Periksa kadar natrium darah (elektrolit) setelah 2-4 minggu pertama memulai terapi.',
    timingAdvice: 'Minum obat pagi hari dengan segelas air.',
    evidenceLevel: 'C'
  },

  // 14. Kortikosteroid (Calcium depletion & Sodium retention)
  {
    id: 'dni_73',
    drugName: 'Prednisone',
    drugClass: 'Kortikosteroid',
    nutrient: 'Kalsium, Vitamin D, Natrium & Kalium',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Kortikosteroid menghambat penyerapan kalsium usus lewat downregulation transporter, sekaligus merangsang osteoklas memecah matriks tulang.',
    recommendation: 'Wajib minum suplemen Kalsium (1000 mg) + Vitamin D3 harian. Kurangi konsumsi garam natrium karena kortikosteroid memicu retensi cairan.',
    timingAdvice: 'Minum suplemen kalsium bersama makan besar, beri jarak 2 jam dari jam minum prednisone pagi hari.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_74',
    drugName: 'Methylprednisolone',
    drugClass: 'Kortikosteroid',
    nutrient: 'Kalsium & Vitamin D',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Memicu apoptosis osteoblas dan menekan transkripsi gen pengikat kalsium di usus (calbindin-D9k).',
    recommendation: 'Pertimbangkan pemeriksaan densitas mineral tulang berkala. Konsumsi teri nasi kering dan brokoli kukus kaya kalsium.',
    timingAdvice: 'Minum obat sesudah makan bersama asupan kalsium laktat.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_75',
    drugName: 'Dexamethasone',
    drugClass: 'Kortikosteroid',
    nutrient: 'Kalsium & Kalium',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Potensi glukokortikoid yang sangat kuat mempercepat peluruhan kalsium skeletal ke sirkulasi ginjal.',
    recommendation: 'Dianjurkan diet kaya protein hewani berkualitas tinggi, tinggi kalium (sari kurma), dan suplemen kalsium karbonat.',
    timingAdvice: 'Ambil dosis harian sedini mungkin di pagi hari untuk meniru ritme kortisol sirkadian.',
    evidenceLevel: 'B'
  },

  // 15. Obat Gout / Asam Urat
  {
    id: 'dni_76',
    drugName: 'Allopurinol',
    drugClass: 'Obat Gout (Asam Urat)',
    nutrient: 'Air Putih (Hidrasi) & Zat Besi',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Hambatan xanthine oxidase menghambat deposisi zat besi di hati, selain itu kristal asam urat yang luruh membutuhkan hidrasi tinggi agar tidak mengendap di tubulus ginjal.',
    recommendation: 'Pastikan minum air putih minimal 2.5 - 3 liter per hari. Batasi suplemen zat besi dosis tinggi tanpa instruksi lab.',
    timingAdvice: 'Minum obat pasca santap makan utama dengan segelas air besar.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_77',
    drugName: 'Colchicine',
    drugClass: 'Obat Gout (Asam Urat)',
    nutrient: 'Vitamin B12 & Lemak',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Colchicine menginduksi malabsorbsi usus umum reversibel dengan merusak anyaman mikrotubulus mukosa enterosit ileum.',
    recommendation: 'Hindari konsumsi makanan tinggi lemak jenuh yang memperlambat motilitas usus, dan tambahkan asupan B12.',
    timingAdvice: 'Bisa diminum bersama atau tanpa makanan, hentikan jika muncul diare parah.',
    evidenceLevel: 'B'
  },

  // 16. Digoxin (Cardiac Glycoside)
  {
    id: 'dni_78',
    drugName: 'Digoxin',
    drugClass: 'Glikosida Jantung',
    nutrient: 'Kalium & Serat Larut Tinggi (Pektin)',
    interactionType: 'antagonizes',
    severity: 'severe',
    mechanism: 'Digoxin bersaing dengan ion kalium untuk berikatan pada pompa Na+/K+ ATPase jantung. Hipokalemia melipatgandakan pengikatan digoxin, memicu toksisitas fatal.',
    recommendation: 'Pertahankan kadar kalium darah stabil di rentang normal tinggi (4.5-5.0 mEq/L). Batasi sereal gandum utuh padat sesaat setelah minum obat.',
    timingAdvice: 'Minum digoxin minimal 1 jam sebelum atau 2 jam setelah makan serat larut tinggi seperti oatmeal atau apel pektin.',
    evidenceLevel: 'A'
  },

  // 17. Levothyroxine (Tiroid)
  {
    id: 'dni_79',
    drugName: 'Levothyroxine',
    drugClass: 'Hormon Tiroid',
    nutrient: 'Kalsium, Zat Besi, Kedelai & Serat Tinggi',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Kalsium karbonat dan zat besi sulfat berikatan fisik langsung dengan levothyroxine di lambung, mencegah penyerapannya di usus halus.',
    recommendation: 'Jangan makan tempe, tahu, susu kedelai, atau suplemen kalsium berdekatan dengan jam bangun tidur saat obat diminum.',
    timingAdvice: 'Minum levothyroxine saat bangun tidur pagi dengan segelas air putih, minimal 60 menit sebelum sarapan atau minum kopi.',
    evidenceLevel: 'A'
  },

  // 18. Imunosupresan
  {
    id: 'dni_80',
    drugName: 'Cyclosporine',
    drugClass: 'Imunosupresan',
    nutrient: 'Jus Grapefruit, Kalium & Magnesium',
    interactionType: 'alters_metabolism',
    severity: 'severe',
    mechanism: 'Cyclosporine dimetabolisme ketat oleh CYP3A4. Hambatan grapefruit melipatgandakan kadar obat hingga merusak ginjal. Obat juga merusak tubulus ginjal, membuang magnesium.',
    recommendation: 'Dilarang minum jus grapefruit. Konsumsi suplemen magnesium laktat dan monitor ketat elektrolit darah.',
    timingAdvice: 'Ambil obat pada waktu yang sama pagi dan malam hari untuk kestabilan kadar terapeutik darah.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_81',
    drugName: 'Tacrolimus',
    drugClass: 'Imunosupresan',
    nutrient: 'Grapefruit & Kalium',
    interactionType: 'alters_metabolism',
    severity: 'severe',
    mechanism: 'Sama dengan cyclosporine, furanokumarin grapefruit menghancurkan klirens tacrolimus sistemik, memicu nefrotoksisitas akut.',
    recommendation: 'Jangan pernah mencampur menu harian dengan grapefruit atau jeruk asam tebal sejenis.',
    timingAdvice: 'Minum obat 1 jam sebelum makan pagi dalam keadaan perut kosong.',
    evidenceLevel: 'A'
  },

  // 19. Antivirus & TBC (Rifampicin, Isoniazid)
  {
    id: 'dni_82',
    drugName: 'Rifampicin',
    drugClass: 'Anti-Tuberkulosis (OAT)',
    nutrient: 'Makanan Lemak Tinggi & Vitamin D',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Makanan berlemak memperlambat waktu pengosongan lambung, menyebabkan obat terdegradasi dan mengurangi konsentrasi puncak plasma hingga 30%.',
    recommendation: 'Minum obat saat lambung kosong. Rifampicin juga menginduksi katabolisme Vitamin D hati, sehingga perlu suplemen pendamping.',
    timingAdvice: 'Minum obat 1 jam sebelum sarapan pagi atau saat bangun tidur.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_83',
    drugName: 'Isoniazid (INH)',
    drugClass: 'Anti-Tuberkulosis (OAT)',
    nutrient: 'Vitamin B6 (Piridoksin)',
    interactionType: 'depletes_nutrient',
    severity: 'severe',
    mechanism: 'Isoniazid berikatan dengan piridoksal fosfat (B6) membentuk kompleks hidrazon larut air yang dibuang ginjal, memicu neuropati perifer parah.',
    recommendation: 'Setiap pasien TBC yang memakan INH wajib mengonsumsi suplemen Vitamin B6 (Piridoksin HCl) sebanyak 10-25 mg/hari.',
    timingAdvice: 'Minum obat INH 1 jam sebelum makan pagi, dan suplemen B6 di siang hari saat makan.',
    evidenceLevel: 'A'
  },

  // 20. Tambahan Obat-Obat Umum Indonesia (Aspirin, Alparazolam, dsb.)
  {
    id: 'dni_84',
    drugName: 'Alprazolam',
    drugClass: 'Benzodiazepine',
    nutrient: 'Kafein & Teh Hijau',
    interactionType: 'antagonizes',
    severity: 'moderate',
    mechanism: 'Kafein memblokir reseptor adenosin di otak yang merangsang saraf, meniadakan efek relaksasi GABA-ergik dari alprazolam.',
    recommendation: 'Hindari meminum kopi, teh botol pekat, atau minuman berenergi agar kecemasan tidak semakin meningkat.',
    timingAdvice: 'Jangan mengonsumsi kafein dalam bentuk apapun minimal 4 jam sebelum tidur.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_85',
    drugName: 'Diazepam',
    drugClass: 'Benzodiazepine',
    nutrient: 'Kafein',
    interactionType: 'antagonizes',
    severity: 'moderate',
    mechanism: 'Efek stimulan saraf kafein berlawanan secara farmakodinamik dengan efek depresan sistem saraf pusat diazepam.',
    recommendation: 'Disarankan minum air putih atau teh chamomile hangat non-kafein di malam hari.',
    timingAdvice: 'Batasi asupan kopi harian maksimal 1 cangkir encer saja di pagi hari.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_86',
    drugName: 'Clonazepam',
    drugClass: 'Benzodiazepine',
    nutrient: 'Kafein',
    interactionType: 'antagonizes',
    severity: 'moderate',
    mechanism: 'Kafein meningkatkan aktivitas glutamatergik yang memicu kewaspadaan tinggi, menyabotase kerja clonazepam sebagai antikejang/antipanik.',
    recommendation: 'Hindari coklat hitam padat murni dan suplemen herba penambah energi.',
    timingAdvice: 'Jangan minum minuman berkafein berdekatan dengan jam minum obat.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_87',
    drugName: 'Pyrazinamide',
    drugClass: 'Anti-Tuberkulosis (OAT)',
    nutrient: 'Air Putih (Hidrasi)',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Menghambat ekskresi asam urat di tubulus ginjal, memicu serangan radang sendi gout sekunder pada penderita TBC.',
    recommendation: 'Minum minimal 3 liter air putih setiap hari untuk membilas asam urat dan mencegah terbentuknya batu ginjal.',
    timingAdvice: 'Minum obat bersama makanan ringan untuk mengurangi mual perut.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_88',
    drugName: 'Ethambutol',
    drugClass: 'Anti-Tuberkulosis (OAT)',
    nutrient: 'Seng (Zinc) & Seng Organik',
    interactionType: 'depletes_nutrient',
    severity: 'moderate',
    mechanism: 'Ethambutol mengkhelat ion tembaga dan seng di sel ganglion retina, berisiko memicu neuritis optik (gangguan pandangan warna merah-hijau).',
    recommendation: 'Disarankan mengonsumsi kerang, daging merah, atau suplemen seng multimineral untuk menjaga fungsi saraf mata.',
    timingAdvice: 'Lakukan skrining lapang pandang warna mata ke dokter spesialis mata jika terapi di atas 2 bulan.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_89',
    drugName: 'Metoclopramide',
    drugClass: 'Antiemetik',
    nutrient: 'Zat Gizi Makro',
    interactionType: 'alters_metabolism',
    severity: 'mild',
    mechanism: 'Mempercepat pengosongan lambung, sehingga memangkas waktu pencernaan enzimatis karbohidrat dan protein di duodenum.',
    recommendation: 'Konsumsi bubur saring atau makanan yang mudah hancur agar zat gizi sempat terserap dengan baik.',
    timingAdvice: 'Minum obat 15-30 menit sebelum makan besar.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_90',
    drugName: 'Domperidone',
    drugClass: 'Antiemetik',
    nutrient: 'Zat Gizi Makro',
    interactionType: 'alters_metabolism',
    severity: 'mild',
    mechanism: 'Mempercepat gerakan peristaltik usus bagian atas, mengurangi durasi penyerapan vitamin larut air di yeyunum.',
    recommendation: 'Pilihlah porsi makan kecil namun sering (small frequent feeding).',
    timingAdvice: 'Minum 15 menit sebelum makan hidangan pembuka.',
    evidenceLevel: 'C'
  },
  {
    id: 'dni_91',
    drugName: 'Bisoprolol',
    drugClass: 'Beta Blocker',
    nutrient: 'Kalsium & Kalium',
    interactionType: 'enhances_effect',
    severity: 'mild',
    mechanism: 'Beta blocker dapat menutupi gejala hipoglikemia dan sedikit menghambat masuknya kalium ke dalam sel pasca makan.',
    recommendation: 'Konsumsi sayuran matang secukupnya, hindari suplemen kalium terkonsentrasi tinggi tanpa cek lab.',
    timingAdvice: 'Minum pagi hari bersama segelas air setelah makan pagi.',
    evidenceLevel: 'C'
  },
  {
    id: 'dni_92',
    drugName: 'Propranolol',
    drugClass: 'Beta Blocker',
    nutrient: 'Protein Tinggi',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Makanan kaya protein tinggi meningkatkan bioavailabilitas propranolol hingga 50% akibat penurunan metabolisme lintas pertama hati.',
    recommendation: 'Makanlah hidangan dengan proporsi protein yang seragam setiap harinya agar konsentrasi obat dalam sirkulasi stabil.',
    timingAdvice: 'Minum obat sesaat setelah makan hidangan seimbang.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_93',
    drugName: 'Atenolol',
    drugClass: 'Beta Blocker',
    nutrient: 'Jus Jeruk Segar',
    interactionType: 'decreases_absorption',
    severity: 'moderate',
    mechanism: 'Keasaman tinggi dari jus jeruk segar menghambat peptida pengangkut anion organik (OATP1A2) yang mengangkut atenolol masuk pembuluh darah usus.',
    recommendation: 'Hindari minum jus jeruk peras asli berdekatan dengan memakan atenolol.',
    timingAdvice: 'Beri jarak minimal 2 jam setelah minum obat sebelum menikmati jeruk segar.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_94',
    drugName: 'Amoxicillin',
    drugClass: 'Antibiotik Penicillin',
    nutrient: 'Serat Makanan Tinggi',
    interactionType: 'decreases_absorption',
    severity: 'mild',
    mechanism: 'Serat larut air yang sangat kental menjebak molekul amoxicillin di lambung, sedikit memperlambat laju penyerapan maksimalnya.',
    recommendation: 'Makan makanan lunak dengan serat sedang selama masa minum antibiotik.',
    timingAdvice: 'Bisa dikonsumsi bersama makanan untuk mengurangi efek samping diare ringan.',
    evidenceLevel: 'C'
  },
  {
    id: 'dni_95',
    drugName: 'Cotrimoxazole',
    drugClass: 'Antibiotik Sulfonamida',
    nutrient: 'Asam Folat',
    interactionType: 'antagonizes',
    severity: 'moderate',
    mechanism: 'Menghambat sintesis asam folat bakteri secara berantai, tetapi juga mengganggu penyimpanan folat intra-seluler inang.',
    recommendation: 'Konsumsi bayam, jeruk, atau suplemen folat jika timbul sariawan atau bibir pecah-pecah pasca konsumsi lama.',
    timingAdvice: 'Minum obat dengan segelas air penuh untuk mencegah kristaluria di saluran kemih.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_96',
    drugName: 'Ketoconazole',
    drugClass: 'Antijamur Azole',
    nutrient: 'Asam Lambung & Kalsium',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Ketoconazole membutuhkan lingkungan lambung yang sangat asam (pH < 2) untuk melarutkan pembungkusnya. Antasida atau susu memblokir penyerapan obat.',
    recommendation: 'Minum obat bersama dengan minuman asam seperti cola atau jus jeruk nipis jika pasien menggunakan penekan asam lambung.',
    timingAdvice: 'Minum obat minimal 2 jam sebelum memakan suplemen kalsium atau antasida.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_97',
    drugName: 'Fluconazole',
    drugClass: 'Antijamur Azole',
    nutrient: 'Natrium',
    interactionType: 'alters_metabolism',
    severity: 'mild',
    mechanism: 'Sedikit mengganggu keseimbangan air ginjal pada penggunaan sistemik jangka panjang.',
    recommendation: 'Pastikan asupan sup kaldu atau masakan bergaram seimbang.',
    timingAdvice: 'Dapat diminum bersama makanan untuk memotong rasa mual di lidah.',
    evidenceLevel: 'C'
  },
  {
    id: 'dni_98',
    drugName: 'Itraconazole',
    drugClass: 'Antijamur Azole',
    nutrient: 'Asam Lambung & Makanan Berlemak',
    interactionType: 'alters_metabolism',
    severity: 'moderate',
    mechanism: 'Kapsul itraconazole memerlukan keasaman lambung tinggi dan lemak makanan untuk membentuk emulsi penyerapan terbaik.',
    recommendation: 'Makan kapsul segera setelah makan hidangan lengkap yang mengandung lemak sehat (misal tumis sayur dengan minyak).',
    timingAdvice: 'Jangan dikonsumsi saat perut kosong total.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_99',
    drugName: 'Griseofulvin',
    drugClass: 'Antijamur',
    nutrient: 'Lemak Makanan (Susu / Mentega)',
    interactionType: 'enhances_effect',
    severity: 'moderate',
    mechanism: 'Griseofulvin bersifat sangat lipofilik. Keberadaan lemak di usus melarutkan kristal obat mikro, mendongkrak penyerapan hingga 2 kali lipat.',
    recommendation: 'Minum obat bersama segelas susu full cream, potongan keju, atau gorengan sehat demi kesembuhan infeksi jamur kulit yang optimal.',
    timingAdvice: 'Wajib diminum segera setelah menyantap makanan berlemak.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_100',
    drugName: 'Carbocisteine',
    drugClass: 'Mukolitik (Obat Batuk)',
    nutrient: 'Air Putih (Hidrasi)',
    interactionType: 'enhances_effect',
    severity: 'mild',
    mechanism: 'Obat memutus ikatan disulfida mukopolisakarida dahak. Asupan air putih tinggi mengencerkan dahak secara mekanis di paru.',
    recommendation: 'Minum minimal 8-10 gelas air putih hangat sehari untuk mempercepat pengeluaran dahak kental.',
    timingAdvice: 'Konsumsi obat sesudah makan, diiringi segelas air hangat.',
    evidenceLevel: 'C'
  },
  {
    id: 'dni_101',
    drugName: 'Salbutamol',
    drugClass: 'Bronkodilator',
    nutrient: 'Kalium (Potassium)',
    interactionType: 'increases_excretion',
    severity: 'moderate',
    mechanism: 'Stimulasi beta-2 adrenergik mengaktifkan pompa Na+/K+ ATPase, menarik kalium ekstraseluler masuk ke intraseluler sel skeletal, memicu hipokalemia transient.',
    recommendation: 'Batasi kopi dan makanan penurun kalium. Makan pisang mas atau melon jika otot bergetar (tremor) hebat.',
    timingAdvice: 'Minum obat 1 jam sebelum makan atau saat terjadi serangan sesak.',
    evidenceLevel: 'B'
  },
  {
    id: 'dni_102',
    drugName: 'Ambroxol',
    drugClass: 'Mukolitik',
    nutrient: 'Air Putih',
    interactionType: 'enhances_effect',
    severity: 'mild',
    mechanism: 'Bekerja meningkatkan sekresi cairan saluran napas. Tanpa kecukupan air putih, dahak tetap akan menempel di bronkus.',
    recommendation: 'Imbangi obat batuk ini dengan air rebusan jahe hangat atau air putih hangat melimpah.',
    timingAdvice: 'Ambil obat setelah makan untuk melindungi mukosa lambung.',
    evidenceLevel: 'C'
  },
  {
    id: 'dni_103',
    drugName: 'Methotrexate',
    drugClass: 'Imunosupresan / Antineoplastik',
    nutrient: 'Asam Folat (Vitamin B9)',
    interactionType: 'antagonizes',
    severity: 'severe',
    mechanism: 'Methotrexate adalah antagonis folat yang menghambat secara kuat enzim dihydrofolate reductase (DHFR), memicu toksisitas sumsum tulang parah.',
    recommendation: 'Suplementasi Asam Folat (asam folinat / leucovorin) wajib diberikan 24 jam setelah dosis methotrexate mingguan sesuai arahan onkolog.',
    timingAdvice: 'Dilarang keras meminum suplemen asam folat pada hari yang sama dengan jadwal konsumsi methotrexate harian/mingguan.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_104',
    drugName: 'Sulfasalazine',
    drugClass: 'Obat Radang Usus / DMARD',
    nutrient: 'Asam Folat',
    interactionType: 'decreases_absorption',
    severity: 'severe',
    mechanism: 'Menghambat penyerapan asam folat di jejunum dengan menghambat enzim konjugase folat usus.',
    recommendation: 'Konsumsi suplemen asam folat harian (1 mg/hari) untuk mencegah terjadinya anemia makrositik.',
    timingAdvice: 'Minum suplemen folat terpisah minimal 4 jam dari jam konsumsi sulfasalazine.',
    evidenceLevel: 'A'
  },
  {
    id: 'dni_105',
    drugName: 'Cyclophosphamide',
    drugClass: 'Kemoterapi / Imunosupresan',
    nutrient: 'Air Putih (Hidrasi masif)',
    interactionType: 'alters_metabolism',
    severity: 'severe',
    mechanism: 'Metabolit aktifnya (akrolein) mengiritasi kandung kemih, memicu sistitis hemoragik (pendarahan urin) jika konsentrasi urin terlalu pekat.',
    recommendation: 'Wajib melakukan hidrasi agresif (minum minimal 3-4 liter air per hari) dan kosongkan kandung kemih sesering mungkin.',
    timingAdvice: 'Minum obat pagi hari agar metabolit tidak mengendap semalaman di kandung kemih selama tidur.',
    evidenceLevel: 'A'
  }
];
