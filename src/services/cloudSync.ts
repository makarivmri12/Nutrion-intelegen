import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config/environment';

// ==============================================================================
// LAYANAN SINKRONISASI CLOUD (SUPABASE)
// ==============================================================================
// Layanan ini mengintegrasikan Supabase untuk sinkronisasi data rekam medis,
// log makanan harian, dan preferensi pengguna dengan ketahanan offline.
// ==============================================================================

// Antarmuka untuk antrean sinkronisasi tunda (offline queue)
interface PendingSyncItem {
  id: string;
  userId: string;
  patients: any[];
  records: any[];
  timestamp: string;
}

const PENDING_SYNC_KEY = 'nutri_pending_sync_queue';

/**
 * Fungsi pembantu untuk mengonversi ID string apa pun (misal: "p-1", "proj-default")
 * menjadi UUID v4 deterministik yang valid untuk database PostgreSQL.
 */
export function toUUID(str: string): string {
  if (!str) return '00000000-0000-0000-0000-000000000000';
  
  // Periksa apakah sudah berupa format UUID yang valid
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  // Hasilkan hash numerik sederhana dari string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Konversi hash menjadi representasi heksadesimal 32 karakter
  let hex = Math.abs(hash).toString(16).padEnd(32, 'a');
  if (hex.length > 32) hex = hex.substring(0, 32);

  // Kembalikan dalam format standar UUID: 8-4-4-4-12
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

// Inisialisasi Klien Supabase secara aman (mencegah crash jika variabel tidak diatur)
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    const url = config.supabaseUrl;
    const anonKey = config.supabaseAnonKey;

    if (!url || !anonKey) {
      console.warn(
        '[SUPABASE]: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diatur. Menjalankan aplikasi dalam mode luring (offline-only).'
      );
      return null;
    }

    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.error('[SUPABASE]: Gagal menginisialisasi Klien Supabase:', err);
    }
  }
  return supabaseInstance;
};

// ------------------------------------------------------------------------------
// PENANGANAN offline retries (ANTREAN TUNDA)
// ------------------------------------------------------------------------------

/**
 * Memasukkan data sinkronisasi ke antrean lokal jika koneksi terputus.
 */
const enqueuePendingSync = (userId: string, patients: any[], records: any[]) => {
  try {
    const queueJson = localStorage.getItem(PENDING_SYNC_KEY);
    const queue: PendingSyncItem[] = queueJson ? JSON.parse(queueJson) : [];
    
    const newItem: PendingSyncItem = {
      id: `pending-${Date.now()}`,
      userId,
      patients,
      records,
      timestamp: new Date().toISOString()
    };
    
    queue.push(newItem);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    console.log('[SINKRONISASI LURING]: Menyimpan data ke antrean lokal karena offline.');
  } catch (err) {
    console.error('[SINKRONISASI LURING]: Gagal mengantrekan data lokal:', err);
  }
};

/**
 * Memproses dan mengunggah semua antrean tunda yang tersimpan di lokal ke awan (cloud).
 */
export const processPendingSyncQueue = async (): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const queueJson = localStorage.getItem(PENDING_SYNC_KEY);
    if (!queueJson) return true;

    const queue: PendingSyncItem[] = JSON.parse(queueJson);
    if (queue.length === 0) return true;

    console.log(`[SINKRONISASI]: Memproses ${queue.length} antrean sinkronisasi tunda...`);
    const successfulIds: string[] = [];

    for (const item of queue) {
      try {
        await syncToCloud(item.userId, item.patients, item.records, true);
        successfulIds.push(item.id);
      } catch (itemErr) {
        console.warn(`[SINKRONISASI]: Gagal memproses antrean item ${item.id}, akan dicoba nanti.`, itemErr);
        // Hentikan proses berantai jika jaringan bermasalah lagi
        break;
      }
    }

    // Bersihkan item yang sukses dikirim dari antrean
    const remainingQueue = queue.filter(item => !successfulIds.includes(item.id));
    if (remainingQueue.length > 0) {
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remainingQueue));
    } else {
      localStorage.removeItem(PENDING_SYNC_KEY);
      console.log('[SINKRONISASI]: Seluruh antrean tunda berhasil disinkronisasikan ke awan!');
    }
    return true;
  } catch (err) {
    console.error('[SINKRONISASI]: Error saat memproses antrean tunda:', err);
    return false;
  }
};

// ------------------------------------------------------------------------------
// OPERASI UTAMA SINKRONISASI (CORE OPERATIONS)
// ------------------------------------------------------------------------------

/**
 * Upsert data pasien dan rekam medis harian ke cloud database Supabase.
 * 
 * @param userId ID pengguna terautentikasi
 * @param patients Daftar pasien lokal
 * @param records Daftar rekaman / log makanan pasien
 * @param isRetry Penanda apakah pemanggilan ini merupakan proses retry dari antrean
 */
export const syncToCloud = async (
  userId: string,
  patients: any[],
  records: any[],
  isRetry = false
): Promise<void> => {
  const supabase = getSupabaseClient();
  const dbUserId = toUUID(userId);

  if (!supabase) {
    if (!isRetry) enqueuePendingSync(userId, patients, records);
    return;
  }

  try {
    console.log('[SINKRONISASI]: Memulai unggah data ke Supabase...');

    // 1. Sinkronisasi Data Pasien
    if (patients && patients.length > 0) {
      const formattedPatients = patients.map(p => ({
        id: toUUID(p.id),
        user_id: dbUserId,
        name: p.name || 'Pasien Tanpa Nama',
        dob: p.dob || null,
        sex: p.gender === 'Male' || p.sex === 'Male' || p.sex === 'male' ? 'Male' : 'Female',
        height: p.height || null,
        weight: p.weight || null,
        pregnancy_status: p.pregnancyStatus || p.pregnancy_status || 'none',
        lactation_status: p.lactationStatus || p.lactation_status || 'none',
        updated_at: new Date().toISOString()
      }));

      const { error: patientErr } = await supabase
        .from('patients')
        .upsert(formattedPatients);

      if (patientErr) throw patientErr;
      console.log(`[SINKRONISASI]: Berhasil mengunggah ${formattedPatients.length} data pasien.`);
    }

    // 2. Sinkronisasi Log Makanan Harian (Food Records)
    if (records && records.length > 0) {
      const formattedRecords = records.map(r => ({
        id: toUUID(r.id),
        user_id: dbUserId,
        patient_id: toUUID(r.patientId || r.patient_id || r.patientProfile?.id),
        record_date: r.recordDate || r.record_date || new Date().toISOString().split('T')[0],
        meal_type: r.mealType || r.meal_type || 'General',
        food_data_json: r.foodDataJson || r.food_data_json || r.foodLogs || r,
        created_at: r.createdAt || r.created_at || new Date().toISOString()
      }));

      const { error: recordErr } = await supabase
        .from('food_records')
        .upsert(formattedRecords);

      if (recordErr) throw recordErr;
      console.log(`[SINKRONISASI]: Berhasil mengunggah ${formattedRecords.length} log makanan.`);
    }

    console.log('[SINKRONISASI]: Proses sinkronisasi ke awan selesai dengan sukses!');
  } catch (err) {
    console.error('[SINKRONISASI]: Kegagalan sinkronisasi:', err);
    if (!isRetry) {
      enqueuePendingSync(userId, patients, records);
    }
    throw err;
  }
};

/**
 * Mengambil data klinis terbaru dari cloud Supabase untuk di-load ke store lokal.
 * 
 * @param userId ID pengguna terautentikasi
 * @returns Object berisi data patients, foodRecords, dan userSettings terbaru
 */
export const syncFromCloud = async (userId: string): Promise<any> => {
  const supabase = getSupabaseClient();
  const dbUserId = toUUID(userId);

  if (!supabase) {
    console.warn('[SINKRONISASI]: Tidak terhubung ke Supabase. Menggunakan data lokal (Offline).');
    return null;
  }

  try {
    console.log('[SINKRONISASI]: Mengunduh data terbaru dari awan...');

    // Ambil data pasien
    const { data: patients, error: patientErr } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', dbUserId);

    if (patientErr) throw patientErr;

    // Ambil data log makanan harian
    const { data: foodRecords, error: recordErr } = await supabase
      .from('food_records')
      .select('*')
      .eq('user_id', dbUserId);

    if (recordErr) throw recordErr;

    // Ambil preferensi pengaturan pengguna
    const { data: userSettings, error: settingsErr } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', dbUserId)
      .maybeSingle();

    if (settingsErr) throw settingsErr;

    console.log('[SINKRONISASI]: Unduh data awan berhasil diselesaikan.');

    return {
      patients: patients || [],
      foodRecords: foodRecords || [],
      userSettings: userSettings ? userSettings.settings_json : null
    };
  } catch (err) {
    console.error('[SINKRONISASI]: Gagal mengambil data dari awan:', err);
    throw err;
  }
};

/**
 * Berlangganan secara langsung (Real-time Subscription) terhadap perubahan data klinis di Supabase.
 * Membantu pembaruan data secara instan jika pengguna menggunakan beberapa gawai sekaligus.
 * 
 * @param userId ID pengguna terautentikasi
 * @param callback Fungsi panggil balik ketika ada pembaruan data terdeteksi
 * @returns Instansi subscription channel untuk pembersihan di akhir siklus hidup komponen
 */
export const subscribeToChanges = (userId: string, callback: (payload: any) => void): any => {
  const supabase = getSupabaseClient();
  const dbUserId = toUUID(userId);

  if (!supabase) {
    console.warn('[REALTIME]: Inisialisasi langganan real-time dibatalkan karena Supabase luring.');
    return null;
  }

  console.log(`[REALTIME]: Membuka saluran langganan real-time untuk user: ${userId}`);

  const channel = supabase
    .channel(`nutri-sync-channel-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        filter: `user_id=eq.${dbUserId}`
      },
      (payload) => {
        console.log('[REALTIME]: Perubahan data terdeteksi dari perangkat lain:', payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log(`[REALTIME]: Status saluran real-time: ${status}`);
    });

  return channel;
};

// Deteksi otomatis pemulihan koneksi internet untuk mengirimkan antrean tunda
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[KONEKSI]: Perangkat kembali daring! Memulai sinkronisasi antrean tunda otomatis...');
    processPendingSyncQueue().catch(err => {
      console.error('[KONEKSI]: Sinkronisasi otomatis pasca daring gagal:', err);
    });
  });
}
