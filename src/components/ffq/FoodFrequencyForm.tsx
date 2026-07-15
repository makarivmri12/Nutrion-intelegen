import React, { useState, useMemo } from "react";
import { useNutriStore } from "../../store/useNutriStore";
import { Search, Plus, Check, RefreshCw, FileSpreadsheet, Trash2 } from "lucide-react";
import { FoodItem } from "../../types";

interface FFQFoodItem {
  id: string;
  name: string;
  category: "Carbs/Staples" | "Animal Protein" | "Plant Protein" | "Vegetable" | "Fruit" | "Dairy" | "Snacks/Fried" | "Beverages";
  smallGrams: number;
  mediumGrams: number;
  largeGrams: number;
  // Nutrient values per 100g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  calcium: number;
  iron: number;
}

// 100+ Common Indonesian Foods with authentic nutritional markers
const INDONESIAN_FFQ_FOODS: FFQFoodItem[] = [
  // Staples (15)
  { id: "ffq-staple-1", name: "Nasi Putih (Steamed Rice)", category: "Carbs/Staples", smallGrams: 100, mediumGrams: 150, largeGrams: 200, calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, calcium: 10, iron: 1.2 },
  { id: "ffq-staple-2", name: "Nasi Merah (Brown Rice)", category: "Carbs/Staples", smallGrams: 100, mediumGrams: 150, largeGrams: 200, calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, calcium: 12, iron: 1.5 },
  { id: "ffq-staple-3", name: "Roti Tawar Putih (White Bread)", category: "Carbs/Staples", smallGrams: 40, mediumGrams: 60, largeGrams: 100, calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, calcium: 260, iron: 3.6 },
  { id: "ffq-staple-4", name: "Roti Gandum (Whole Wheat Bread)", category: "Carbs/Staples", smallGrams: 40, mediumGrams: 60, largeGrams: 100, calories: 247, protein: 12.0, carbs: 41.3, fat: 3.4, fiber: 6.0, calcium: 161, iron: 2.5 },
  { id: "ffq-staple-5", name: "Mie Instan (Indomie)", category: "Carbs/Staples", smallGrams: 80, mediumGrams: 120, largeGrams: 160, calories: 450, protein: 9.0, carbs: 64.0, fat: 17.0, fiber: 2.0, calcium: 25, iron: 1.8 },
  { id: "ffq-staple-6", name: "Mie Ayam (Chicken Noodles)", category: "Carbs/Staples", smallGrams: 150, mediumGrams: 250, largeGrams: 350, calories: 180, protein: 8.5, carbs: 24.2, fat: 5.6, fiber: 1.2, calcium: 30, iron: 1.4 },
  { id: "ffq-staple-7", name: "Bubur Ayam (Chicken Porridge)", category: "Carbs/Staples", smallGrams: 150, mediumGrams: 250, largeGrams: 400, calories: 85, protein: 3.2, carbs: 12.0, fat: 2.5, fiber: 0.4, calcium: 15, iron: 0.8 },
  { id: "ffq-staple-8", name: "Singkong Rebus (Boiled Cassava)", category: "Carbs/Staples", smallGrams: 80, mediumGrams: 120, largeGrams: 200, calories: 160, protein: 1.4, carbs: 38.0, fat: 0.3, fiber: 1.8, calcium: 16, iron: 0.3 },
  { id: "ffq-staple-9", name: "Ubi Manis Kukus (Steamed Sweet Potato)", category: "Carbs/Staples", smallGrams: 80, mediumGrams: 120, largeGrams: 200, calories: 86, protein: 1.6, carbs: 20.0, fat: 0.1, fiber: 3.0, calcium: 30, iron: 0.6 },
  { id: "ffq-staple-10", name: "Kentang Rebus (Boiled Potato)", category: "Carbs/Staples", smallGrams: 80, mediumGrams: 120, largeGrams: 200, calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.8, calcium: 5, iron: 0.3 },
  { id: "ffq-staple-11", name: "Kentang Goreng (French Fries)", category: "Carbs/Staples", smallGrams: 70, mediumGrams: 100, largeGrams: 150, calories: 312, protein: 3.4, carbs: 41.0, fat: 15.0, fiber: 3.8, calcium: 18, iron: 0.8 },
  { id: "ffq-staple-12", name: "Lontong / Ketupat (Rice Cake)", category: "Carbs/Staples", smallGrams: 80, mediumGrams: 120, largeGrams: 200, calories: 144, protein: 2.4, carbs: 31.5, fat: 0.2, fiber: 0.3, calcium: 8, iron: 1.0 },
  { id: "ffq-staple-13", name: "Kwetiau Goreng (Fried Flat Noodles)", category: "Carbs/Staples", smallGrams: 150, mediumGrams: 250, largeGrams: 350, calories: 220, protein: 4.8, carbs: 32.0, fat: 8.5, fiber: 0.9, calcium: 15, iron: 1.1 },
  { id: "ffq-staple-14", name: "Bihun Goreng (Fried Vermicelli)", category: "Carbs/Staples", smallGrams: 100, mediumGrams: 180, largeGrams: 250, calories: 195, protein: 3.5, carbs: 31.0, fat: 6.5, fiber: 1.0, calcium: 20, iron: 1.2 },
  { id: "ffq-staple-15", name: "Nasi Uduk (Coconut Rice)", category: "Carbs/Staples", smallGrams: 100, mediumGrams: 150, largeGrams: 200, calories: 165, protein: 3.2, carbs: 30.5, fat: 4.2, fiber: 0.5, calcium: 14, iron: 1.3 },

  // Animal Protein (18)
  { id: "ffq-animal-1", name: "Ayam Goreng (Fried Chicken)", category: "Animal Protein", smallGrams: 60, mediumGrams: 100, largeGrams: 150, calories: 246, protein: 25.0, carbs: 0.0, fat: 16.0, fiber: 0.0, calcium: 15, iron: 1.3 },
  { id: "ffq-animal-2", name: "Ayam Bakar (Grilled Chicken)", category: "Animal Protein", smallGrams: 60, mediumGrams: 100, largeGrams: 150, calories: 198, protein: 26.5, carbs: 2.1, fat: 9.5, fiber: 0.0, calcium: 14, iron: 1.2 },
  { id: "ffq-animal-3", name: "Daging Sapi Rendang (Beef Rendang)", category: "Animal Protein", smallGrams: 50, mediumGrams: 80, largeGrams: 120, calories: 194, protein: 19.8, carbs: 4.5, fat: 11.2, fiber: 0.5, calcium: 22, iron: 2.8 },
  { id: "ffq-animal-4", name: "Sapi Semur (Stewed Beef)", category: "Animal Protein", smallGrams: 50, mediumGrams: 80, largeGrams: 120, calories: 180, protein: 20.1, carbs: 5.2, fat: 8.4, fiber: 0.2, calcium: 19, iron: 2.5 },
  { id: "ffq-animal-5", name: "Telur Dadar (Fried Omelette)", category: "Animal Protein", smallGrams: 50, mediumGrams: 75, largeGrams: 100, calories: 196, protein: 12.0, carbs: 1.2, fat: 15.4, fiber: 0.0, calcium: 54, iron: 1.8 },
  { id: "ffq-animal-6", name: "Telur Ceplok (Fried Egg)", category: "Animal Protein", smallGrams: 50, mediumGrams: 60, largeGrams: 80, calories: 185, protein: 12.4, carbs: 0.8, fat: 14.1, fiber: 0.0, calcium: 51, iron: 1.6 },
  { id: "ffq-animal-7", name: "Telur Rebus (Boiled Egg)", category: "Animal Protein", smallGrams: 50, mediumGrams: 60, largeGrams: 80, calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0.0, calcium: 50, iron: 1.2 },
  { id: "ffq-animal-8", name: "Ikan Lele Goreng (Fried Catfish)", category: "Animal Protein", smallGrams: 80, mediumGrams: 120, largeGrams: 180, calories: 232, protein: 18.5, carbs: 0.0, fat: 17.5, fiber: 0.0, calcium: 35, iron: 1.5 },
  { id: "ffq-animal-9", name: "Ikan Kembung Goreng (Fried Mackerel)", category: "Animal Protein", smallGrams: 80, mediumGrams: 120, largeGrams: 180, calories: 225, protein: 22.0, carbs: 0.0, fat: 15.0, fiber: 0.0, calcium: 40, iron: 2.1 },
  { id: "ffq-animal-10", name: "Ikan Gurame Bakar (Grilled Carp)", category: "Animal Protein", smallGrams: 100, mediumGrams: 200, largeGrams: 300, calories: 145, protein: 19.0, carbs: 1.5, fat: 7.2, fiber: 0.0, calcium: 25, iron: 1.1 },
  { id: "ffq-animal-11", name: "Ikan Asin Goreng (Salted Fried Fish)", category: "Animal Protein", smallGrams: 15, mediumGrams: 30, largeGrams: 50, calories: 310, protein: 42.0, carbs: 0.0, fat: 15.0, fiber: 0.0, calcium: 200, iron: 3.5 },
  { id: "ffq-animal-12", name: "Bakso Sapi Kuah (Beef Meatballs with Soup)", category: "Animal Protein", smallGrams: 100, mediumGrams: 180, largeGrams: 280, calories: 142, protein: 11.5, carbs: 8.5, fat: 6.8, fiber: 0.3, calcium: 18, iron: 1.4 },
  { id: "ffq-animal-13", name: "Udang Goreng Tepung (Fried Tempura Shrimp)", category: "Animal Protein", smallGrams: 60, mediumGrams: 100, largeGrams: 150, calories: 280, protein: 17.0, carbs: 15.0, fat: 16.5, fiber: 0.5, calcium: 85, iron: 1.9 },
  { id: "ffq-animal-14", name: "Cumi Goreng Tepung (Fried Squid Calamari)", category: "Animal Protein", smallGrams: 60, mediumGrams: 100, largeGrams: 150, calories: 275, protein: 16.0, carbs: 14.5, fat: 16.0, fiber: 0.3, calcium: 32, iron: 1.0 },
  { id: "ffq-animal-15", name: "Daging Kambing Gulai (Goat Curry)", category: "Animal Protein", smallGrams: 60, mediumGrams: 100, largeGrams: 150, calories: 210, protein: 18.2, carbs: 3.5, fat: 14.0, fiber: 0.2, calcium: 25, iron: 2.9 },
  { id: "ffq-animal-16", name: "Sate Ayam (Chicken Satay - 5/10 skewers)", category: "Animal Protein", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 219, protein: 24.2, carbs: 5.5, fat: 10.8, fiber: 0.2, calcium: 15, iron: 1.4 },
  { id: "ffq-animal-17", name: "Sosis Sapi Goreng (Fried Beef Sausage)", category: "Animal Protein", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 330, protein: 12.0, carbs: 4.5, fat: 29.0, fiber: 0.0, calcium: 12, iron: 1.1 },
  { id: "ffq-animal-18", name: "Kornet Sapi (Corned Beef)", category: "Animal Protein", smallGrams: 40, mediumGrams: 75, largeGrams: 120, calories: 251, protein: 14.5, carbs: 1.2, fat: 21.0, fiber: 0.0, calcium: 9, iron: 2.0 },

  // Plant Protein (12)
  { id: "ffq-plant-1", name: "Tempe Goreng (Fried Tempeh)", category: "Plant Protein", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 220, protein: 15.0, carbs: 11.2, fat: 14.2, fiber: 4.8, calcium: 111, iron: 2.7 },
  { id: "ffq-plant-2", name: "Tempe Bacem (Stewed Tempeh)", category: "Plant Protein", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 178, protein: 12.5, carbs: 16.0, fat: 7.2, fiber: 4.5, calcium: 105, iron: 2.5 },
  { id: "ffq-plant-3", name: "Tahu Goreng (Fried Tofu)", category: "Plant Protein", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 140, protein: 10.5, carbs: 4.2, fat: 9.8, fiber: 1.2, calcium: 180, iron: 2.2 },
  { id: "ffq-plant-4", name: "Tahu Putih Kukus (Steamed White Tofu)", category: "Plant Protein", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.3, calcium: 350, iron: 5.4 },
  { id: "ffq-plant-5", name: "Kacang Tanah Goreng (Fried Peanuts)", category: "Plant Protein", smallGrams: 20, mediumGrams: 40, largeGrams: 80, calories: 585, protein: 25.0, carbs: 21.5, fat: 49.0, fiber: 8.0, calcium: 90, iron: 4.5 },
  { id: "ffq-plant-6", name: "Kacang Hijau Rebus (Mung Beans)", category: "Plant Protein", smallGrams: 50, mediumGrams: 100, largeGrams: 180, calories: 105, protein: 7.0, carbs: 19.0, fat: 0.4, fiber: 7.6, calcium: 27, iron: 1.4 },
  { id: "ffq-plant-7", name: "Bubur Kacang Hijau (Mung Bean Porridge)", category: "Plant Protein", smallGrams: 100, mediumGrams: 200, largeGrams: 300, calories: 145, protein: 4.5, carbs: 25.0, fat: 3.2, fiber: 3.8, calcium: 22, iron: 1.0 },
  { id: "ffq-plant-8", name: "Susu Kedelai (Soy Milk)", category: "Plant Protein", smallGrams: 150, mediumGrams: 200, largeGrams: 300, calories: 54, protein: 3.3, carbs: 6.0, fat: 1.8, fiber: 0.6, calcium: 120, iron: 0.6 },
  { id: "ffq-plant-9", name: "Gado-gado (Vegetables with Peanut Sauce)", category: "Plant Protein", smallGrams: 150, mediumGrams: 250, largeGrams: 350, calories: 165, protein: 6.8, carbs: 18.0, fat: 8.5, fiber: 3.2, calcium: 110, iron: 2.0 },
  { id: "ffq-plant-10", name: "Kacang Merah Rebus (Red Kidney Beans)", category: "Plant Protein", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 7.4, calcium: 28, iron: 2.2 },
  { id: "ffq-plant-11", name: "Tempe Orek (Sweet Stir-fried Tempeh)", category: "Plant Protein", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 260, protein: 16.5, carbs: 22.0, fat: 12.8, fiber: 4.2, calcium: 115, iron: 2.6 },
  { id: "ffq-plant-12", name: "Kacang Cashew Goreng (Fried Cashews)", category: "Plant Protein", smallGrams: 20, mediumGrams: 40, largeGrams: 80, calories: 553, protein: 18.2, carbs: 30.1, fat: 43.8, fiber: 3.3, calcium: 37, iron: 6.7 },

  // Vegetables (15)
  { id: "ffq-veg-1", name: "Kangkung Cah (Stir-fried Water Spinach)", category: "Vegetable", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 65, protein: 2.5, carbs: 4.2, fat: 4.8, fiber: 2.1, calcium: 73, iron: 1.7 },
  { id: "ffq-veg-2", name: "Sayur Bayam Bening (Clear Spinach Soup)", category: "Vegetable", smallGrams: 100, mediumGrams: 150, largeGrams: 250, calories: 25, protein: 1.8, carbs: 3.5, fat: 0.2, fiber: 1.5, calcium: 85, iron: 2.5 },
  { id: "ffq-veg-3", name: "Capcay Goreng (Mixed Vegetables Stir-fried)", category: "Vegetable", smallGrams: 100, mediumGrams: 150, largeGrams: 250, calories: 75, protein: 3.0, carbs: 6.8, fat: 4.5, fiber: 1.9, calcium: 42, iron: 1.0 },
  { id: "ffq-veg-4", name: "Wortel Rebus (Boiled Carrots)", category: "Vegetable", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 35, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 3.0, calcium: 33, iron: 0.3 },
  { id: "ffq-veg-5", name: "Brokoli Kukus (Steamed Broccoli)", category: "Vegetable", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, calcium: 47, iron: 0.7 },
  { id: "ffq-veg-6", name: "Sayur Sop (Standard Vegetable Soup)", category: "Vegetable", smallGrams: 100, mediumGrams: 200, largeGrams: 300, calories: 45, protein: 1.5, carbs: 8.5, fat: 0.5, fiber: 1.2, calcium: 20, iron: 0.6 },
  { id: "ffq-veg-7", name: "Sayur Asem (Tamarind Vegetable Soup)", category: "Vegetable", smallGrams: 100, mediumGrams: 200, largeGrams: 300, calories: 50, protein: 1.2, carbs: 10.5, fat: 0.8, fiber: 1.4, calcium: 35, iron: 0.8 },
  { id: "ffq-veg-8", name: "Tumis Sawi Putih (Napa Cabbage Stir-fry)", category: "Vegetable", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 48, protein: 1.3, carbs: 3.2, fat: 3.5, fiber: 1.2, calcium: 40, iron: 0.8 },
  { id: "ffq-veg-9", name: "Lalapan Timun & Kemangi (Raw Cucumber & Basil)", category: "Vegetable", smallGrams: 30, mediumGrams: 60, largeGrams: 100, calories: 12, protein: 0.6, carbs: 2.2, fat: 0.1, fiber: 0.8, calcium: 15, iron: 0.3 },
  { id: "ffq-veg-10", name: "Terong Balado (Spicy Eggplant)", category: "Vegetable", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 115, protein: 1.5, carbs: 8.5, fat: 9.2, fiber: 2.5, calcium: 22, iron: 0.6 },
  { id: "ffq-veg-11", name: "Tumis Kacang Panjang (Long Beans Stir-fry)", category: "Vegetable", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 72, protein: 2.1, carbs: 5.8, fat: 4.8, fiber: 2.2, calcium: 45, iron: 1.1 },
  { id: "ffq-veg-12", name: "Urap Sayur (Vegetables with Spiced Grated Coconut)", category: "Vegetable", smallGrams: 80, mediumGrams: 120, largeGrams: 180, calories: 98, protein: 3.2, carbs: 9.5, fat: 5.8, fiber: 3.5, calcium: 82, iron: 1.5 },
  { id: "ffq-veg-13", name: "Sayur Lodeh (Vegetables in Coconut Milk Soup)", category: "Vegetable", smallGrams: 100, mediumGrams: 200, largeGrams: 300, calories: 120, protein: 2.5, carbs: 9.2, fat: 9.0, fiber: 1.8, calcium: 55, iron: 1.2 },
  { id: "ffq-veg-14", name: "Tumis Buncis (Green Beans Stir-fry)", category: "Vegetable", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 68, protein: 1.9, carbs: 6.2, fat: 4.5, fiber: 2.7, calcium: 38, iron: 0.9 },
  { id: "ffq-veg-15", name: "Tomat Merah Segar (Fresh Red Tomato)", category: "Vegetable", smallGrams: 50, mediumGrams: 80, largeGrams: 120, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, calcium: 10, iron: 0.3 },

  // Fruits (12)
  { id: "ffq-fruit-1", name: "Pisang Ambon (Cavendish Banana)", category: "Fruit", smallGrams: 80, mediumGrams: 120, largeGrams: 160, calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, calcium: 5, iron: 0.3 },
  { id: "ffq-fruit-2", name: "Pepaya Matang (Ripe Papaya)", category: "Fruit", smallGrams: 100, mediumGrams: 150, largeGrams: 250, calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7, calcium: 20, iron: 0.3 },
  { id: "ffq-fruit-3", name: "Semangka Merah (Watermelon)", category: "Fruit", smallGrams: 100, mediumGrams: 180, largeGrams: 280, calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, calcium: 7, iron: 0.2 },
  { id: "ffq-fruit-4", name: "Melon Hijau (Honeydew Melon)", category: "Fruit", smallGrams: 100, mediumGrams: 150, largeGrams: 250, calories: 36, protein: 0.5, carbs: 9.0, fat: 0.1, fiber: 0.8, calcium: 6, iron: 0.2 },
  { id: "ffq-fruit-5", name: "Mangga Harum Manis (Mango)", category: "Fruit", smallGrams: 100, mediumGrams: 160, largeGrams: 250, calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, calcium: 11, iron: 0.2 },
  { id: "ffq-fruit-6", name: "Jeruk Manis (Sweet Orange)", category: "Fruit", smallGrams: 80, mediumGrams: 120, largeGrams: 180, calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, calcium: 40, iron: 0.1 },
  { id: "ffq-fruit-7", name: "Apel Fuji (Fuji Apple)", category: "Fruit", smallGrams: 100, mediumGrams: 150, largeGrams: 200, calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, calcium: 6, iron: 0.1 },
  { id: "ffq-fruit-8", name: "Alpukat Mentega (Butter Avocado)", category: "Fruit", smallGrams: 80, mediumGrams: 130, largeGrams: 200, calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, calcium: 12, iron: 0.6 },
  { id: "ffq-fruit-9", name: "Nanas Subang (Subang Pineapple)", category: "Fruit", smallGrams: 80, mediumGrams: 120, largeGrams: 200, calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, calcium: 13, iron: 0.3 },
  { id: "ffq-fruit-10", name: "Salak Pondoh (Snakefruit)", category: "Fruit", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 82, protein: 0.8, carbs: 20.4, fat: 0.4, fiber: 2.1, calcium: 38, iron: 1.2 },
  { id: "ffq-fruit-11", name: "Durian Montong (Durian Pulp)", category: "Fruit", smallGrams: 50, mediumGrams: 100, largeGrams: 200, calories: 147, protein: 1.5, carbs: 27.1, fat: 5.3, fiber: 3.8, calcium: 40, iron: 1.0 },
  { id: "ffq-fruit-12", name: "Pepaya California (California Papaya)", category: "Fruit", smallGrams: 100, mediumGrams: 150, largeGrams: 250, calories: 45, protein: 0.6, carbs: 11.2, fat: 0.2, fiber: 1.8, calcium: 22, iron: 0.3 },

  // Dairy (8)
  { id: "ffq-dairy-1", name: "Susu Sapi Segar (Fresh Cow Milk)", category: "Dairy", smallGrams: 150, mediumGrams: 200, largeGrams: 300, calories: 64, protein: 3.2, carbs: 4.7, fat: 3.6, fiber: 0.0, calcium: 120, iron: 0.1 },
  { id: "ffq-dairy-2", name: "Susu Bubuk Full Cream (Full Cream Milk Powder)", category: "Dairy", smallGrams: 20, mediumGrams: 35, largeGrams: 50, calories: 496, protein: 26.3, carbs: 38.4, fat: 26.7, fiber: 0.0, calcium: 912, iron: 0.5 },
  { id: "ffq-dairy-3", name: "Yogurt Plain (Plain Sugarless Yogurt)", category: "Dairy", smallGrams: 100, mediumGrams: 150, largeGrams: 200, calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0.0, calcium: 110, iron: 0.1 },
  { id: "ffq-dairy-4", name: "Keju Cheddar (Cheddar Cheese Block)", category: "Dairy", smallGrams: 10, mediumGrams: 20, largeGrams: 40, calories: 403, protein: 24.9, carbs: 1.3, fat: 33.1, fiber: 0.0, calcium: 721, iron: 0.2 },
  { id: "ffq-dairy-5", name: "Susu Kental Manis (Sweet Condensed Milk)", category: "Dairy", smallGrams: 15, mediumGrams: 30, largeGrams: 50, calories: 321, protein: 7.9, carbs: 54.0, fat: 8.7, fiber: 0.0, calcium: 284, iron: 0.2 },
  { id: "ffq-dairy-6", name: "Mentega / Butter", category: "Dairy", smallGrams: 5, mediumGrams: 10, largeGrams: 20, calories: 717, protein: 0.9, carbs: 0.1, fat: 81.1, fiber: 0.0, calcium: 24, iron: 0.0 },
  { id: "ffq-dairy-7", name: "Margarin", category: "Dairy", smallGrams: 5, mediumGrams: 10, largeGrams: 20, calories: 713, protein: 0.2, carbs: 0.9, fat: 80.5, fiber: 0.0, calcium: 20, iron: 0.1 },
  { id: "ffq-dairy-8", name: "Susu UHT Cokelat (Chocolate UHT Milk)", category: "Dairy", smallGrams: 125, mediumGrams: 200, largeGrams: 250, calories: 82, protein: 3.0, carbs: 11.5, fat: 2.6, fiber: 0.4, calcium: 105, iron: 0.4 },

  // Snacks/Fried (14)
  { id: "ffq-snack-1", name: "Bakwan Sayur Goreng (Vegetable Fritter)", category: "Snacks/Fried", smallGrams: 40, mediumGrams: 80, largeGrams: 150, calories: 280, protein: 3.5, carbs: 32.4, fat: 15.6, fiber: 1.5, calcium: 18, iron: 1.2 },
  { id: "ffq-snack-2", name: "Tempe Mendoan (Soft Fried Spiced Tempeh)", category: "Snacks/Fried", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 245, protein: 12.0, carbs: 15.6, fat: 15.8, fiber: 3.8, calcium: 98, iron: 2.1 },
  { id: "ffq-snack-3", name: "Tahu Isi Goreng (Fried Stuffed Tofu)", category: "Snacks/Fried", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 230, protein: 8.5, carbs: 18.0, fat: 14.2, fiber: 1.8, calcium: 140, iron: 1.8 },
  { id: "ffq-snack-4", name: "Pisang Goreng Tepung (Fried Banana)", category: "Snacks/Fried", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 252, protein: 1.8, carbs: 42.1, fat: 9.5, fiber: 2.2, calcium: 14, iron: 0.6 },
  { id: "ffq-snack-5", name: "Kerupuk Putih Kaleng (White Crackers)", category: "Snacks/Fried", smallGrams: 10, mediumGrams: 20, largeGrams: 40, calories: 476, protein: 1.0, carbs: 68.0, fat: 22.0, fiber: 0.2, calcium: 12, iron: 0.4 },
  { id: "ffq-snack-6", name: "Martabak Manis Cokelat (Sweet Chocolate Pancake)", category: "Snacks/Fried", smallGrams: 80, mediumGrams: 150, largeGrams: 250, calories: 345, protein: 7.2, carbs: 48.0, fat: 14.5, fiber: 2.0, calcium: 110, iron: 2.1 },
  { id: "ffq-snack-7", name: "Martabak Telur Daging (Savory Meat Pancake)", category: "Snacks/Fried", smallGrams: 80, mediumGrams: 150, largeGrams: 250, calories: 290, protein: 13.5, carbs: 21.0, fat: 17.2, fiber: 0.8, calcium: 65, iron: 1.9 },
  { id: "ffq-snack-8", name: "Siomay Bandung (Steamed Fish Dumplings)", category: "Snacks/Fried", smallGrams: 100, mediumGrams: 180, largeGrams: 250, calories: 180, protein: 10.5, carbs: 21.5, fat: 6.2, fiber: 1.1, calcium: 45, iron: 1.1 },
  { id: "ffq-snack-9", name: "Batagor dengan Bumbu Kacang (Fried Dumplings with Peanut Sauce)", category: "Snacks/Fried", smallGrams: 100, mediumGrams: 180, largeGrams: 250, calories: 290, protein: 11.0, carbs: 28.0, fat: 14.8, fiber: 1.5, calcium: 55, iron: 1.3 },
  { id: "ffq-snack-10", name: "Cilok Bumbu Kacang (Chewy Tapioca Balls)", category: "Snacks/Fried", smallGrams: 50, mediumGrams: 100, largeGrams: 150, calories: 210, protein: 1.5, carbs: 44.5, fat: 3.2, fiber: 0.4, calcium: 10, iron: 0.5 },
  { id: "ffq-snack-11", name: "Cireng Goreng (Fried Chewy Fritter)", category: "Snacks/Fried", smallGrams: 40, mediumGrams: 80, largeGrams: 120, calories: 360, protein: 0.8, carbs: 68.0, fat: 9.8, fiber: 0.2, calcium: 5, iron: 0.3 },
  { id: "ffq-snack-12", name: "Singkong Goreng (Crispy Fried Cassava)", category: "Snacks/Fried", smallGrams: 80, mediumGrams: 120, largeGrams: 200, calories: 240, protein: 1.2, carbs: 41.5, fat: 7.8, fiber: 1.6, calcium: 15, iron: 0.4 },
  { id: "ffq-snack-13", name: "Donat Kentang Gula (Sugar Potato Donut)", category: "Snacks/Fried", smallGrams: 50, mediumGrams: 90, largeGrams: 150, calories: 380, protein: 5.5, carbs: 48.0, fat: 18.2, fiber: 1.4, calcium: 25, iron: 1.1 },
  { id: "ffq-snack-14", name: "Kue Nastar (Pineapple Jam Tart Cookies)", category: "Snacks/Fried", smallGrams: 20, mediumGrams: 40, largeGrams: 80, calories: 460, protein: 5.0, carbs: 62.0, fat: 21.0, fiber: 1.0, calcium: 30, iron: 0.9 },

  // Beverages (10)
  { id: "ffq-bev-1", name: "Teh Manis Hangat (Sweet Hot Tea)", category: "Beverages", smallGrams: 150, mediumGrams: 200, largeGrams: 300, calories: 40, protein: 0.0, carbs: 10.0, fat: 0.0, fiber: 0.0, calcium: 2, iron: 0.0 },
  { id: "ffq-bev-2", name: "Es Teh Manis (Iced Sweet Tea)", category: "Beverages", smallGrams: 200, mediumGrams: 300, largeGrams: 450, calories: 60, protein: 0.0, carbs: 15.0, fat: 0.0, fiber: 0.0, calcium: 3, iron: 0.0 },
  { id: "ffq-bev-3", name: "Kopi Hitam + Gula (Black Sweet Coffee)", category: "Beverages", smallGrams: 150, mediumGrams: 200, largeGrams: 300, calories: 45, protein: 0.2, carbs: 11.0, fat: 0.0, fiber: 0.0, calcium: 4, iron: 0.1 },
  { id: "ffq-bev-4", name: "Kopi Susu Gula Aren (Sweet Palm Sugar Milk Coffee)", category: "Beverages", smallGrams: 150, mediumGrams: 250, largeGrams: 350, calories: 140, protein: 2.8, carbs: 22.5, fat: 4.2, fiber: 0.2, calcium: 95, iron: 0.2 },
  { id: "ffq-bev-5", name: "Jus Alpukat dengan SKM (Avocado Juice with Sweet Milk)", category: "Beverages", smallGrams: 200, mediumGrams: 300, largeGrams: 400, calories: 120, protein: 1.8, carbs: 18.0, fat: 7.4, fiber: 3.4, calcium: 35, iron: 0.4 },
  { id: "ffq-bev-6", name: "Es Kelapa Muda Manis (Sweet Iced Coconut Water with Pulp)", category: "Beverages", smallGrams: 200, mediumGrams: 300, largeGrams: 500, calories: 38, protein: 0.4, carbs: 9.1, fat: 0.1, fiber: 0.8, calcium: 24, iron: 0.3 },
  { id: "ffq-bev-7", name: "Minuman Bersoda (Carbonated Soda Can)", category: "Beverages", smallGrams: 250, mediumGrams: 330, largeGrams: 500, calories: 42, protein: 0.0, carbs: 10.6, fat: 0.0, fiber: 0.0, calcium: 2, iron: 0.0 },
  { id: "ffq-bev-8", name: "Es Cendol / Dawet (Coconut Milk & Palm Sugar Jelly Ice)", category: "Beverages", smallGrams: 150, mediumGrams: 250, largeGrams: 350, calories: 160, protein: 1.2, carbs: 28.5, fat: 4.8, fiber: 0.6, calcium: 32, iron: 0.4 },
  { id: "ffq-bev-9", name: "Jus Jeruk Peras (Fresh Squeezed Orange Juice with Sugar)", category: "Beverages", smallGrams: 150, mediumGrams: 200, largeGrams: 300, calories: 65, protein: 0.7, carbs: 15.5, fat: 0.1, fiber: 0.4, calcium: 11, iron: 0.1 },
  { id: "ffq-bev-10", name: "Sirup Cocopandan Manis (Sweet Red Syrup Drink)", category: "Beverages", smallGrams: 150, mediumGrams: 200, largeGrams: 300, calories: 80, protein: 0.0, carbs: 20.0, fat: 0.0, fiber: 0.0, calcium: 1, iron: 0.0 }
];

interface FormState {
  frequency: number; // times per period
  period: "daily" | "weekly" | "monthly" | "never";
  portionSize: "small" | "medium" | "large";
}

export default function FoodFrequencyForm() {
  const { currentProjectId, addFoodLogEntry, foodDatabase } = useNutriStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Keep track of user inputs for each food item
  const [formInputs, setFormInputs] = useState<Record<string, FormState>>({});

  // Reset all inputs
  const handleReset = () => {
    if (confirm("Reset seluruh form Food Frequency Questionnaire ini?")) {
      setFormInputs({});
    }
  };

  const handleInputChange = (
    foodId: string,
    field: keyof FormState,
    value: any
  ) => {
    setFormInputs((prev) => {
      const current = prev[foodId] || { frequency: 1, period: "never", portionSize: "medium" };
      const updated = { ...current, [field]: value };
      
      // If period is changed to "never", clear frequency
      if (field === "period" && value === "never") {
        updated.frequency = 0;
      } else if (field === "period" && current.period === "never" && value !== "never") {
        updated.frequency = 1;
      }
      
      return { ...prev, [foodId]: updated };
    });
  };

  // List of active categories
  const categories = ["ALL", "Carbs/Staples", "Animal Protein", "Plant Protein", "Vegetable", "Fruit", "Dairy", "Snacks/Fried", "Beverages"];

  // Filter food list
  const filteredFoods = useMemo(() => {
    return INDONESIAN_FFQ_FOODS.filter((food) => {
      const matchesCategory = selectedCategory === "ALL" || food.category === selectedCategory;
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Calculate stats for completed items
  const activeEntries = useMemo(() => {
    const list: { food: FFQFoodItem; input: FormState; dailyAmount: number; calories: number; protein: number; carbs: number; fat: number; fiber: number; calcium: number; iron: number }[] = [];
    
    Object.entries(formInputs).forEach(([foodId, inputVal]) => {
      const input = inputVal as FormState;
      if (input.period === "never" || input.frequency <= 0) return;
      
      const food = INDONESIAN_FFQ_FOODS.find((f) => f.id === foodId);
      if (!food) return;

      const grams = input.portionSize === "small" ? food.smallGrams 
                    : input.portionSize === "large" ? food.largeGrams 
                    : food.mediumGrams;

      const multiplier = input.period === "daily" ? 1 : 
                         input.period === "weekly" ? 1 / 7 : 1 / 30;
                         
      const dailyAmount = input.frequency * grams * multiplier;
      const scale = dailyAmount / 100;

      list.push({
        food,
        input,
        dailyAmount: parseFloat(dailyAmount.toFixed(1)),
        calories: Math.round(food.calories * scale),
        protein: parseFloat((food.protein * scale).toFixed(1)),
        carbs: parseFloat((food.carbs * scale).toFixed(1)),
        fat: parseFloat((food.fat * scale).toFixed(1)),
        fiber: parseFloat((food.fiber * scale).toFixed(1)),
        calcium: Math.round(food.calcium * scale),
        iron: parseFloat((food.iron * scale).toFixed(1))
      });
    });

    return list;
  }, [formInputs]);

  // Aggregate totals
  const aggregatedTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, iron: 0 };
    activeEntries.forEach((entry) => {
      totals.calories += entry.calories;
      totals.protein += entry.protein;
      totals.carbs += entry.carbs;
      totals.fat += entry.fat;
      totals.fiber += entry.fiber;
      totals.calcium += entry.calcium;
      totals.iron += entry.iron;
    });
    
    // Round them nicely
    return {
      calories: Math.round(totals.calories),
      protein: parseFloat(totals.protein.toFixed(1)),
      carbs: parseFloat(totals.carbs.toFixed(1)),
      fat: parseFloat(totals.fat.toFixed(1)),
      fiber: parseFloat(totals.fiber.toFixed(1)),
      calcium: Math.round(totals.calcium),
      iron: parseFloat(totals.iron.toFixed(1))
    };
  }, [activeEntries]);

  // Export to spreadsheet handler
  const handleApplyToSpreadsheet = () => {
    if (!currentProjectId) {
      alert("Pilih pasien aktif terlebih dahulu!");
      return;
    }
    if (activeEntries.length === 0) {
      alert("Tidak ada asupan habitual terdeteksi di dalam FFQ.");
      return;
    }

    if (
      confirm(
        `Apply asupan harian dari FFQ (${activeEntries.length} jenis makanan) ke spreadsheet harian aktif? Ini akan menambahkan makanan dengan berat harian rata-rata.`
      )
    ) {
      activeEntries.forEach((entry) => {
        // Map FFQFoodItem properties to standard database FoodItem
        const standardFood: FoodItem = {
          id: entry.food.id,
          name: entry.food.name,
          category: entry.food.category,
          calories: entry.food.calories,
          protein: entry.food.protein,
          carbs: entry.food.carbs,
          fat: entry.food.fat,
          fiber: entry.food.fiber,
          sodium: 150, // default approximation
          calcium: entry.food.calcium,
          iron: entry.food.iron,
          vitaminC: 10,
          potassium: 150,
          magnesium: 15,
          zinc: 0.5,
          folate: 15,
          vitaminA: 30,
          water: 80,
          sugar: 2,
          portions: [
            { name: "Small", weightGrams: entry.food.smallGrams },
            { name: "Medium", weightGrams: entry.food.mediumGrams },
            { name: "Large", weightGrams: entry.food.largeGrams }
          ]
        };

        addFoodLogEntry(standardFood, entry.dailyAmount, `Rata-rata FFQ Harian`);
      });

      alert(`Berhasil menambahkan ${activeEntries.length} makanan habitual harian ke spreadsheet!`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 font-sans text-zinc-300" id="ffq-container">
      {/* Header Panel */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span className="text-[#00d4ff]">Food Frequency Questionnaire (FFQ)</span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-1 font-mono">
            Instrumen clinical untuk menilai asupan habitual pasien (100+ makanan lokal Indonesia).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs rounded text-zinc-300 font-mono flex items-center space-x-2 border border-zinc-700 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
            <span>Reset Form</span>
          </button>
          
          <button
            onClick={handleApplyToSpreadsheet}
            className="py-1.5 px-3 bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-xs rounded text-[#00d4ff] font-mono flex items-center space-x-2 border border-[#00d4ff]/30 cursor-pointer transition-colors"
            title="Import calculated daily amounts to daily food logs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Apply to Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Left form, Right telemetry summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Space: Foods list selector */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls: Search & Category filter */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search 100+ Indonesian foods..."
                className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00d4ff]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30"
                      : "bg-[#1a1a1a] text-zinc-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Foods Table Grid */}
          <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] border-b border-[#27272a] text-zinc-400 font-mono">
                    <th className="p-3">Food Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Frequency Choice</th>
                    <th className="p-3">Portion Size</th>
                    <th className="p-3 text-right">Est. Daily Intake</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                        No Indonesian foods match search query.
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map((food) => {
                      const input = formInputs[food.id] || { frequency: 0, period: "never", portionSize: "medium" };
                      const grams = input.portionSize === "small" ? food.smallGrams 
                                    : input.portionSize === "large" ? food.largeGrams 
                                    : food.mediumGrams;
                      
                      const multiplier = input.period === "daily" ? 1 : 
                                         input.period === "weekly" ? 1 / 7 : 1 / 30;
                      const dailyAverageGrams = input.period === "never" ? 0 : input.frequency * grams * multiplier;

                      return (
                        <tr key={food.id} className="hover:bg-[#18181b]/50 transition-colors">
                          <td className="p-3 font-medium text-white">
                            <div>{food.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              {food.calories} kcal/100g • P {food.protein}g • C {food.carbs}g • Ca {food.calcium}mg
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                              {food.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1.5">
                              {/* Period selection */}
                              <select
                                value={input.period}
                                onChange={(e) => handleInputChange(food.id, "period", e.target.value)}
                                className="bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-[11px] text-zinc-300 font-mono"
                              >
                                <option value="never">Never/Rarely</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>

                              {/* Frequency input */}
                              {input.period !== "never" && (
                                <input
                                  type="number"
                                  min={1}
                                  max={input.period === "daily" ? 10 : 30}
                                  value={input.frequency || ""}
                                  onChange={(e) => handleInputChange(food.id, "frequency", Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-12 bg-[#1a1a1a] border border-[#27272a] rounded px-1.5 py-1 text-center text-[11px] text-white font-mono"
                                />
                              )}
                              
                              {input.period !== "never" && (
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {input.period === "daily" ? "x/day" : input.period === "weekly" ? "x/week" : "x/month"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {input.period !== "never" ? (
                              <div className="flex items-center space-x-1">
                                {["small", "medium", "large"].map((sz) => {
                                  const labelGrams = sz === "small" ? food.smallGrams : sz === "large" ? food.largeGrams : food.mediumGrams;
                                  const isActive = input.portionSize === sz;
                                  return (
                                    <button
                                      key={sz}
                                      onClick={() => handleInputChange(food.id, "portionSize", sz)}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                                        isActive
                                          ? "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/40 font-bold"
                                          : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white"
                                      }`}
                                      title={`${labelGrams} grams`}
                                    >
                                      {sz[0].toUpperCase()} ({labelGrams}g)
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-zinc-600 font-mono text-[10px]">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-[11px] font-semibold text-[#00d4ff]">
                            {dailyAverageGrams > 0 ? (
                              <span>{dailyAverageGrams.toFixed(1)} g/day</span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Space: Habitual Aggregation Telemetry */}
        <div className="space-y-6">
          {/* Aggregated Totals Panel */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2 font-mono">
              <span>HABITUAL DAILY INTAKE SUMMARY</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-400">Total Calories</span>
                <span className="text-xl font-mono font-bold text-amber-400">
                  {aggregatedTotals.calories} <span className="text-[10px] text-zinc-500">kcal</span>
                </span>
              </div>

              {/* Macros Breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1a1a1a] rounded p-2 text-center border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">Protein</div>
                  <div className="text-xs font-mono font-semibold text-purple-400 mt-1">
                    {aggregatedTotals.protein}g
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 text-center border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">Carbs</div>
                  <div className="text-xs font-mono font-semibold text-[#00d4ff] mt-1">
                    {aggregatedTotals.carbs}g
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded p-2 text-center border border-zinc-800">
                  <div className="text-[10px] text-zinc-500">Fat</div>
                  <div className="text-xs font-mono font-semibold text-rose-400 mt-1">
                    {aggregatedTotals.fat}g
                  </div>
                </div>
              </div>

              {/* Micros Details */}
              <div className="space-y-2 text-xs font-mono pt-2 border-t border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Calcium (Ca)</span>
                  <span className="text-zinc-300">{aggregatedTotals.calcium} mg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Iron (Fe)</span>
                  <span className="text-zinc-300">{aggregatedTotals.iron} mg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dietary Fiber</span>
                  <span className="text-zinc-300">{aggregatedTotals.fiber} g</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-[10px] text-[#a1a1aa] leading-relaxed">
                📢 <strong className="text-white">Clinical Note:</strong> Habitual intake represents estimated baseline nutrition derived from long-term self-reports. Compare this aggregate output directly with daily dietary records inside the **Clinical Analytics** tab to identify deficits.
              </div>
            </div>
          </div>

          {/* Active Logged Items breakdown */}
          <div className="bg-[#121212] border border-[#27272a] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-3 font-mono">
              ACTIVE FFQ SELECTIONS ({activeEntries.length})
            </h3>
            
            {activeEntries.length === 0 ? (
              <p className="text-xs text-zinc-500 font-mono">
                Pilih frekuensi makan untuk memicu kalkulasi asupan habitual.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {activeEntries.map(({ food, input, dailyAmount, calories }) => (
                  <div
                    key={food.id}
                    className="flex justify-between items-center text-xs bg-[#1a1a1a] border border-zinc-800 p-2 rounded"
                  >
                    <div>
                      <div className="font-semibold text-white truncate max-w-[150px]">{food.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 capitalize">
                        {input.frequency}x/{input.period} • {input.portionSize}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[#00d4ff] font-bold">{dailyAmount}g/day</div>
                      <div className="text-[9px] text-zinc-500 font-mono">{calories} kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
