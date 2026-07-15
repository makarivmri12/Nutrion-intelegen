-- ==============================================================================
-- SKEMA DATABASE POSTGRESQL UNTUK CLOUD SYNC - SUPABASE
-- ==============================================================================
-- Skema ini dirancang untuk Nutri-Intelligence Platform guna mendukung
-- sinkronisasi rekam medis pasien, log makanan harian, dan preferensi pengguna.
--
-- Catatan Keamanan: Semua tabel dilindungi dengan Row Level Security (RLS) yang ketat.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABEL: Patients (Profil Pasien)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Merujuk ke auth.uid() pengguna di Supabase Auth
    name TEXT NOT NULL,
    dob DATE, -- Tanggal lahir pasien
    sex TEXT CHECK (sex IN ('Male', 'Female')),
    height NUMERIC, -- Tinggi badan dalam cm
    weight NUMERIC, -- Berat badan dalam kg
    pregnancy_status TEXT CHECK (pregnancy_status IN ('none', 'trimester1', 'trimester2', 'trimester3')),
    lactation_status TEXT CHECK (lactation_status IN ('none', 'months0to6', 'months7to12')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.patients IS 'Menyimpan data profil pasien dan rekam medis klinis modular.';
COMMENT ON COLUMN public.patients.user_id IS 'ID Pengguna / Ahli Gizi pemilik data pasien ini.';

-- ------------------------------------------------------------------------------
-- 2. TABEL: Food Records (Log Makanan Harian)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Merujuk ke auth.uid() pengguna di Supabase Auth
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    meal_type TEXT, -- e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    food_data_json JSONB NOT NULL, -- Menyimpan log komprehensif nutrisi (FoodLogEntry[])
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.food_records IS 'Menyimpan rekaman log makanan harian pasien untuk analisis klinis.';

-- ------------------------------------------------------------------------------
-- 3. TABEL: User Settings (Preferensi Pengguna / Ahli Gizi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE, -- Merujuk ke auth.uid() pengguna di Supabase Auth
    settings_json JSONB NOT NULL, -- Menyimpan preferensi UI, default unit, target nutrisi umum
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_settings IS 'Menyimpan pengaturan aplikasi, konfigurasi instansi, dan parameter klinis pengguna.';

-- ------------------------------------------------------------------------------
-- 4. PEMBUATAN INDEKS (INDEXES) UNTUK OPTIMALISASI QUERY
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_food_records_user_id ON public.food_records(user_id);
CREATE INDEX IF NOT EXISTS idx_food_records_patient_id ON public.food_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ------------------------------------------------------------------------------
-- 5. AKTIVASI ROW LEVEL SECURITY (RLS) - MANDATORY FOR PRODUCTION SECURITY
-- ------------------------------------------------------------------------------
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6. KEBIJAKAN KEAMANAN (POLICIES) UNTUK MASING-MASING TABEL
-- ------------------------------------------------------------------------------

-- Kebijakan Keamanan untuk Tabel: Patients
CREATE POLICY "Pengguna hanya dapat membaca data pasien mereka sendiri"
    ON public.patients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menambahkan data pasien mereka sendiri"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat memperbarui data pasien mereka sendiri"
    ON public.patients FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menghapus data pasien mereka sendiri"
    ON public.patients FOR DELETE
    USING (auth.uid() = user_id);


-- Kebijakan Keamanan untuk Tabel: Food Records
CREATE POLICY "Pengguna hanya dapat membaca log makanan mereka sendiri"
    ON public.food_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menambahkan log makanan mereka sendiri"
    ON public.food_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat memperbarui log makanan mereka sendiri"
    ON public.food_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menghapus log makanan mereka sendiri"
    ON public.food_records FOR DELETE
    USING (auth.uid() = user_id);


-- Kebijakan Keamanan untuk Tabel: User Settings
CREATE POLICY "Pengguna hanya dapat membaca preferensi mereka sendiri"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menambahkan preferensi mereka sendiri"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat memperbarui preferensi mereka sendiri"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya dapat menghapus preferensi mereka sendiri"
    ON public.user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. OTOMATISASI KOLOM updated_at (TRIGGER FUNCTION)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_modtime
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_settings_modtime
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
