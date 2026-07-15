import { useNutriStore } from "../store/useNutriStore";
import { usePatientStore } from "../store/usePatientStore";

export interface BackupData {
  projects: any[];
  patients: any[];
  settings: {
    theme: string;
    fontSize: number;
    autoSave: boolean;
    defaultDatabase: string;
  };
  timestamp: string;
}

// Key names in LocalStorage
const PROJECTS_KEY = "nutri_platform_projects";
const PATIENTS_KEY = "nutrisurvey_patients";
const SETTINGS_KEY = "nutri_platform_settings";

export const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return {
    theme: "dark",
    fontSize: 14,
    autoSave: true,
    defaultDatabase: "INDONESIAN",
  };
};

export const saveStoredSettings = (settings: any) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

export const collectAllData = (): BackupData => {
  const projectsRaw = localStorage.getItem(PROJECTS_KEY);
  const patientsRaw = localStorage.getItem(PATIENTS_KEY);
  
  const projects = projectsRaw ? JSON.parse(projectsRaw) : [];
  const patients = patientsRaw ? JSON.parse(patientsRaw) : [];
  const settings = getStoredSettings();

  return {
    projects,
    patients,
    settings,
    timestamp: new Date().toISOString()
  };
};

export const saveToIndexedDB = (id: string, data: any): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") {
        resolve(false);
        return;
      }
      const request = indexedDB.open("NutriIntelligenceDB", 1);

      request.onerror = (event: any) => {
        console.warn(`IndexedDB open error for ID ${id} (autosave disabled or sandboxed):`, event.target?.error);
        resolve(false);
      };

      request.onblocked = () => {
        console.warn("IndexedDB open blocked");
        resolve(false);
      };

      request.onupgradeneeded = (event: any) => {
        try {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("backups")) {
            db.createObjectStore("backups", { keyPath: "id" });
          }
        } catch (upgradeErr) {
          console.warn("Failed during IndexedDB upgradeneeded:", upgradeErr);
        }
      };

      request.onsuccess = (event: any) => {
        try {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("backups")) {
            resolve(false);
            return;
          }
          const transaction = db.transaction(["backups"], "readwrite");

          transaction.onerror = (txEvent: any) => {
            console.warn("IndexedDB transaction error:", txEvent.target?.error);
            resolve(false);
          };

          const store = transaction.objectStore("backups");
          const putRequest = store.put({ id, data, timestamp: new Date().toISOString() });

          putRequest.onsuccess = () => {
            resolve(true);
          };
          
          putRequest.onerror = (putEvent: any) => {
            console.warn("IndexedDB put request error:", putEvent.target?.error);
            resolve(false);
          };
        } catch (innerErr) {
          console.warn("Error running transaction in IndexedDB:", innerErr);
          resolve(false);
        }
      };
    } catch (e) {
      console.warn("Failed to open IndexedDB:", e);
      resolve(false);
    }
  });
};

export const createBackupFile = async (data: BackupData): Promise<boolean> => {
  return saveToIndexedDB("autosave", data);
};

export const createBackup = async () => {
  const data = collectAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `nutri-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

export const restoreBackup = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as BackupData;
    
    if (!data.projects || !data.patients) {
      throw new Error("Format file backup tidak valid.");
    }

    // Save to LocalStorage
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(data.projects));
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(data.patients));
    if (data.settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    }

    // Attempt to write to IndexedDB safely using saveToIndexedDB helper
    await saveToIndexedDB("last_restore", data);

    return true;
  } catch (e: any) {
    console.error("Restore backup error:", e);
    throw new Error(e.message || "Failed to parse backup file");
  }
};

export const syncToCloud = async (userId: string, data: any) => {
  // Optional/Simulated Cloud sync
  console.log("Simulating cloud sync for", userId, data);
  localStorage.setItem(`nutri_cloud_sync_${userId}`, JSON.stringify({
    data,
    updatedAt: new Date().toISOString()
  }));
};

export const syncFromCloud = async (userId: string) => {
  const stored = localStorage.getItem(`nutri_cloud_sync_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};
