/**
 * Deteksi Platform dan Konfigurasi Runtime Environment
 * Menyediakan konfigurasi environment terpadu dan fallback aman untuk Web serta Desktop (Tauri).
 */

// Deteksi apakah aplikasi berjalan di dalam konteks desktop Tauri
export const isDesktop = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;
export const isWeb = !isDesktop;

// Representasi type-safe untuk objek konfigurasi aplikasi
export interface AppConfig {
  platform: 'web' | 'desktop';
  version: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  sentryDsn: string;
  posthogKey: string;
  apiUrl: string;
}

// Fallback default untuk pengembangan (development)
const DEFAULT_CONFIG: AppConfig = {
  platform: isDesktop ? 'desktop' : 'web',
  version: '1.0.0',
  supabaseUrl: '',
  supabaseAnonKey: '',
  sentryDsn: '',
  posthogKey: '',
  apiUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
};

/**
 * Mengambil konfigurasi lingkungan saat ini dengan validasi field wajib.
 */
export const getEnvironmentConfig = (): AppConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  // Muat variabel lingkungan dari Vite dengan fallback nilai default
  const version = (import.meta.env.VITE_APP_VERSION as string) || DEFAULT_CONFIG.version;
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_CONFIG.supabaseUrl;
  const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || DEFAULT_CONFIG.supabaseAnonKey;
  const sentryDsn = (import.meta.env.VITE_SENTRY_DSN as string) || DEFAULT_CONFIG.sentryDsn;
  const posthogKey = (import.meta.env.VITE_POSTHOG_KEY as string) || DEFAULT_CONFIG.posthogKey;

  // Resolusi URL Backend API. Untuk Tauri, arahkan ke backend produksi; untuk Web gunakan relative origin.
  const apiUrl = isDesktop
    ? ((import.meta.env.VITE_API_URL as string) || 'https://ais-pre-t6vkfkk4rqkxuglrrrda54-569143138524.asia-east1.run.app')
    : window.location.origin;

  // ----------------------------------------------------------------------------
  // Validasi Variabel Wajib (Required Fields)
  // ----------------------------------------------------------------------------
  if (!import.meta.env.VITE_APP_VERSION) {
    console.warn(
      '[KONFIGURASI]: VITE_APP_VERSION tidak terdefinisi di environment. Menggunakan nilai default: ' +
        DEFAULT_CONFIG.version
    );
  }

  return {
    platform: isDesktop ? 'desktop' : 'web',
    version,
    supabaseUrl,
    supabaseAnonKey,
    sentryDsn,
    posthogKey,
    apiUrl,
  };
};

// Ekspor konfigurasi aplikasi sebagai instansi tunggal (Singleton)
export const config = getEnvironmentConfig();
export default config;
