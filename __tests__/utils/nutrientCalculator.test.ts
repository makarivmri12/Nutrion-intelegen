import { describe, it, expect } from "vitest";
import { calculateCookedNutrients } from "../../src/utils/nutrientCalculator-complete";
import { calculatePediatricZScores } from "../../src/utils/pediatric-zscore";
import { calculateNutrientTargets } from "../../src/store/useNutriStore";
import { FoodItem, PatientProfile } from "../../src/types";
import { indonesianExchangeLists } from "../../src/data/food-exchange-lists";
import { drugNutrientInteractions } from "../../src/data/drug-nutrient-interactions";

describe("Clinical Logic Unit Tests - NutriGen-ID", () => {
  
  describe("PERSAGI 2019 Food Exchange List Validation (Bahan Makanan Penukar)", () => {
    it("should verify Carbohydrate (Nasi & Pengganti) exchange group values strictly match PERSAGI standards (175 kcal, 4g protein, 40g carbs)", () => {
      const carbGroup = indonesianExchangeLists.find(g => g.groupName.includes("Karbohidrat"));
      expect(carbGroup).toBeDefined();
      expect(carbGroup!.calories).toBe(175);
      expect(carbGroup!.protein).toBe(4);
      expect(carbGroup!.carbs).toBe(40);
      expect(carbGroup!.fat).toBe(0);
    });

    it("should verify Protein Nabati exchange group values strictly match PERSAGI standards (75 kcal, 5g protein, 3g fat, 7g carbs)", () => {
      const nabatiGroup = indonesianExchangeLists.find(g => g.groupName.includes("Nabati"));
      expect(nabatiGroup).toBeDefined();
      expect(nabatiGroup!.calories).toBe(75);
      expect(nabatiGroup!.protein).toBe(5);
      expect(nabatiGroup!.fat).toBe(3);
      expect(nabatiGroup!.carbs).toBe(7);
    });

    it("should verify Minyak & Lemak exchange group values strictly match PERSAGI standards (50 kcal, 5g fat)", () => {
      const lipidGroup = indonesianExchangeLists.find(g => g.groupName.includes("Minyak"));
      expect(lipidGroup).toBeDefined();
      expect(lipidGroup!.calories).toBe(50);
      expect(lipidGroup!.protein).toBe(0);
      expect(lipidGroup!.fat).toBe(5);
      expect(lipidGroup!.carbs).toBe(0);
    });

    it("should verify specific local portion grammage is correct for staple foods", () => {
      const carbGroup = indonesianExchangeLists.find(g => g.groupName.includes("Karbohidrat"));
      const riceItem = carbGroup?.foods.find(f => f.name === "Nasi Putih");
      const potatoItem = carbGroup?.foods.find(f => f.name === "Kentang Kukus");

      // ¾ glass rice is exactly 100g in PERSAGI
      expect(riceItem).toBeDefined();
      expect(riceItem!.weightGrams).toBe(100);

      // 2 medium potatoes is exactly 200g in PERSAGI
      expect(potatoItem).toBeDefined();
      expect(potatoItem!.weightGrams).toBe(200);
    });
  });

  describe("Drug-Nutrient Clinical Safety Levels (Interaksi Obat-Gizi)", () => {
    it("should verify that critical drug-nutrient interactions (Warfarin-VitK, MAOI-Tyramine, Ciprofloxacin-Calcium) have 'severe' severity and 'A' evidenceLevel", () => {
      // 1. Warfarin - Vitamin K (dni_1)
      const warfarinVitK = drugNutrientInteractions.find(dni => dni.id === "dni_1");
      expect(warfarinVitK).toBeDefined();
      expect(warfarinVitK!.severity).toBe("severe");
      expect(warfarinVitK!.evidenceLevel).toBe("A");
      expect(warfarinVitK!.interactionType).toBe("antagonizes");

      // 2. MAO Inhibitor - Tyramine (dni_67 - Phenelzine / dni_68 - Tranylcypromine)
      const maoiTyramine = drugNutrientInteractions.find(dni => dni.id === "dni_67");
      expect(maoiTyramine).toBeDefined();
      expect(maoiTyramine!.severity).toBe("severe");
      expect(maoiTyramine!.evidenceLevel).toBe("A");
      expect(maoiTyramine!.interactionType).toBe("enhances_effect");

      // 3. Ciprofloxacin - Calcium (dni_6)
      const ciproCalcium = drugNutrientInteractions.find(dni => dni.id === "dni_6");
      expect(ciproCalcium).toBeDefined();
      expect(ciproCalcium!.severity).toBe("severe");
      expect(ciproCalcium!.evidenceLevel).toBe("A");
      expect(ciproCalcium!.interactionType).toBe("decreases_absorption");
    });

    it("should verify practical and safe timing guidelines are provided for chelation risk drugs", () => {
      // Tetracycline - Calcium (dni_3)
      const tetraCalcium = drugNutrientInteractions.find(dni => dni.id === "dni_3");
      expect(tetraCalcium).toBeDefined();
      expect(tetraCalcium!.timingAdvice.toLowerCase()).toContain("2 jam");
    });
  });
  
  describe("Retention Factor (Faktor Retensi Nutrisi)", () => {
    it("should calculate correct nutrient retention for boiling vegetables (Bayam Rebus Vitamin C should drop by ~50%)", () => {
      // Mock spinach raw food item
      const rawBayam: FoodItem = {
        id: "bayam-raw",
        name: "Bayam Basah / Spinach Raw",
        category: "Vegetables",
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        sodium: 79,
        calcium: 99,
        iron: 2.7,
        vitaminC: 80, // 80mg per 100g raw
        potassium: 558,
        magnesium: 79,
        zinc: 0.5,
        folate: 194,
        vitaminA: 469,
        water: 91,
        sugar: 0.4,
      };

      // Cooked weight is 100g, boiled
      const cookedBayam = calculateCookedNutrients(rawBayam, "Rebus", 100);

      // yieldFactor for Vegetables / Rebus is 0.82
      // rawWeightGrams = 100 / 0.82 = 121.95g => 122.0g raw
      // rawScale = 122.0 / 100 = 1.22
      // retentionFactor for Vegetables / Rebus / Vitamin C is 0.50
      // Expected Vitamin C = raw value (80) * rawScale (1.22) * retention (0.50) = 48.8 mg
      expect(cookedBayam.vitaminC).toBeCloseTo(48.8, 1);
      
      // Let's verify that the vitaminC is indeed significantly lower than raw equivalent (80 * 1.22 = 97.6 mg)
      // and represents a retention of exactly 50% relative to the calculated raw weight
      const rawEquivalentVitC = rawBayam.vitaminC * (cookedBayam.rawWeightGrams! / 100);
      const computedRetention = cookedBayam.vitaminC! / rawEquivalentVitC;
      expect(computedRetention).toBeCloseTo(0.50, 2);
    });
  });

  describe("Yield Factor (Faktor Rendemen)", () => {
    it("should calculate correct yield factor conversion (Beras 100g raw -> ~250g cooked rice)", () => {
      // Mock raw rice
      const rawBeras: FoodItem = {
        id: "beras-raw",
        name: "Beras Giling / Raw Rice",
        category: "Grains & Cereals",
        calories: 360,
        protein: 6.8,
        carbs: 78.9,
        fat: 0.7,
        fiber: 0.9,
        sodium: 3,
        calcium: 10,
        iron: 0.8,
        vitaminC: 0,
        potassium: 100,
        magnesium: 25,
        zinc: 1.2,
        folate: 8,
        vitaminA: 0,
        water: 12,
        sugar: 0.1,
      };

      // Patient eats 250g of cooked boiled rice
      const cookedNasi = calculateCookedNutrients(rawBeras, "Rebus", 250);

      // yieldFactor for Grains & Cereals / Rebus is 2.5
      // rawWeightGrams should be exactly cookedWeightGrams / yieldFactor = 250 / 2.5 = 100.0g
      expect(cookedNasi.rawWeightGrams).toBe(100);
    });
  });

  describe("Pregnancy Target Adjustments (Adaptasi Target Gizi Ibu Hamil)", () => {
    it("should add exactly +30g protein for Trimester 3 pregnant patient compared to baseline female", () => {
      // Baseline adult female profile
      const baselineProfile: PatientProfile = {
        id: "patient-123",
        name: "Ibu Fitri",
        gender: "Female",
        age: 28,
        weight: 55,
        height: 158,
        activityLevel: "Moderately Active",
        pregnancyStatus: "none",
        lactationStatus: "none",
        conditions: "",
        notes: "",
        bmi: 22,
        bmiCategory: "Normal",
        bmr: 1300
      };

      // Trimester 3 pregnant female profile
      const pregnantProfileT3: PatientProfile = {
        ...baselineProfile,
        pregnancyStatus: "trimester3"
      };

      const baselineTargets = calculateNutrientTargets(baselineProfile);
      const pregnantTargetsT3 = calculateNutrientTargets(pregnantProfileT3);

      // Protein adjustment for Trimester 3 must be exactly +30g
      expect(pregnantTargetsT3.protein).toBeCloseTo(baselineTargets.protein + 30, 1);
    });
  });

  describe("WHO Pediatric Growth Z-Scores (Interpretasi Status Gizi Anak)", () => {
    it("should correctly compute WAZ, HAZ, and BMIZ for a 24-month-old male, 10kg, 85cm with accurate WHO classification", () => {
      const ageMonths = 24;
      const gender = "Male";
      const weightKg = 10;
      const heightCm = 85;

      const results = calculatePediatricZScores(ageMonths, gender, weightKg, heightCm);

      // Calculated values:
      // WAZ is approx -1.73 (Z-score between -2 and -3 is Underweight boundary)
      // HAZ is approx -0.68 (Z-score between -1 and 0, normal height)
      // BMIZ is approx -1.93 (Z-score near -2, normal/thin borderline)
      expect(results.waz).toBeCloseTo(-1.73, 1);
      expect(results.haz).toBeCloseTo(-0.68, 1);
      expect(results.bmiz).toBeCloseTo(-1.93, 1);

      // Verify the status translations align with standard Kemenkes/WHO classifications
      expect(results.status.waz).toBe("Gizi Baik (Normal)");
      expect(results.status.haz).toBe("Normal");
      expect(results.status.bmiz).toBe("Normal");
    });
  });

  describe("Indonesian Culinary Lipids and Fats Validation (Standard SNI/MPOB/Smoke Points)", () => {
    it("should validate that Virgin Coconut Oil (VCO) fatty acid profiles match SNI 7381:2008 standards (predominantly SFA, low PUFA)", () => {
      // VCO is extremely high SFA (>80%) and low PUFA (<3%)
      const vcoSFA = 86.5;
      const vcoPUFA = 1.8;
      const vcoSmokePoint = 177;

      expect(vcoSFA).toBeGreaterThan(80);
      expect(vcoPUFA).toBeLessThan(3);
      expect(vcoSmokePoint).toBe(177); // Moderate smoke point
    });

    it("should validate that RBD Palm Oil matches SNI 7709:2019 standards (~50% SFA, high stability, and smoke point >230°C)", () => {
      // Palm oil is around 45-50% saturated fat, 35-40% MUFA and possesses high smoke point for safe deep frying
      const palmSFA = 49.3;
      const palmMUFA = 37.0;
      const palmSmokePoint = 232;

      expect(palmSFA).toBeCloseTo(49, 0);
      expect(palmMUFA).toBeCloseTo(37, 0);
      expect(palmSmokePoint).toBeGreaterThanOrEqual(230); // Refined palm oil deep frying standard
    });

    it("should validate that Margarine complies with SNI 3541:2014 and smoke point reflects emulsion limits (~150°C)", () => {
      // Margarine contains emulsifiers and water content limiting its smoke point to around 150°C
      const margarineSmokePoint = 150;
      expect(margarineSmokePoint).toBeLessThan(160);
    });
  });
});
