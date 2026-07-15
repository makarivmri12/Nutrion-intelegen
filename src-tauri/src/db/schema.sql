-- =====================================================================
-- NUTRI-INTELLIGENCE PLATFORM (DESKTOP OFFLINE-FIRST SCHEMA)
-- SQLite Schema for @tauri-apps/plugin-sql
-- =====================================================================

-- 1. Patients Registry Table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    sex TEXT CHECK(sex IN ('male', 'female')) NOT NULL,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    activity_level TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    patient_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

-- 3. Custom Foods Database Table
CREATE TABLE IF NOT EXISTS custom_foods (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    calories REAL NOT NULL, -- per 100g
    protein REAL NOT NULL, -- per 100g
    carbs REAL NOT NULL, -- per 100g
    fat REAL NOT NULL, -- per 100g
    fiber REAL NOT NULL, -- per 100g
    sodium REAL NOT NULL, -- per 100g
    calcium REAL NOT NULL, -- per 100g
    iron REAL NOT NULL, -- per 100g
    vitamin_c REAL NOT NULL, -- per 100g
    potassium REAL NOT NULL, -- per 100g
    magnesium REAL NOT NULL, -- per 100g
    zinc REAL NOT NULL, -- per 100g
    folate REAL NOT NULL, -- per 100g
    vitamin_a REAL NOT NULL, -- per 100g
    water REAL NOT NULL, -- per 100g
    sugar REAL NOT NULL, -- per 100g
    database_source TEXT DEFAULT 'CUSTOM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Food Intake Logs Table
CREATE TABLE IF NOT EXISTS food_logs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    food_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    weight_grams REAL NOT NULL,
    portion_name TEXT,
    
    -- Dynamically calculated nutrients for log weight
    calories REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    fiber REAL NOT NULL,
    sodium REAL NOT NULL,
    calcium REAL NOT NULL,
    iron REAL NOT NULL,
    vitamin_c REAL NOT NULL,
    potassium REAL NOT NULL,
    magnesium REAL NOT NULL,
    zinc REAL NOT NULL,
    folate REAL NOT NULL,
    vitamin_a REAL NOT NULL,
    water REAL NOT NULL,
    sugar REAL NOT NULL,
    
    -- Additional detailed lipids
    fat_saturated REAL,
    fat_monounsaturated REAL,
    fat_polyunsaturated REAL,
    cholesterol REAL,

    -- Amino acids
    tryptophan REAL,
    leucine REAL,
    lysine REAL,
    methionine REAL,
    phenylalanine REAL,
    valine REAL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(code);
CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON custom_foods(name);
CREATE INDEX IF NOT EXISTS idx_food_logs_project ON food_logs(project_id);
