import { create } from "zustand";

export interface Patient {
  id: string;
  code: string;
  name: string;
  dob: string;
  sex: "male" | "female";
  height: number;
  weight: number;
  activityLevel: string; // sedentary, light, medium, heavy, veryHeavy
  phone?: string;
  email?: string;
}

interface PatientStore {
  patients: Patient[];
  activePatientId: string | null;
  addPatient: (p: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  setActivePatient: (id: string) => void;
  calculateBMR: (p: Omit<Patient, "id" | "code">, method: string) => number;
  calculateTDEE: (bmr: number, activity: string) => number;
  calculateBMI: (weight: number, height: number) => number;
  getBMIColor: (bmi: number) => string;
  getBMICategory: (bmi: number) => string;
}

export function calculateAge(dob: string): number {
  if (!dob) return 30;
  const birth = new Date(dob);
  const diff = Date.now() - birth.getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(age) || age < 0 ? 30 : age;
}

const getStoredPatients = (): Patient[] => {
  try {
    const stored = localStorage.getItem("nutrisurvey_patients");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load patients from localstorage", e);
  }
  return [
    {
      id: "p-1",
      code: "PAT-001",
      name: "Budi Santoso",
      dob: "1984-06-15",
      sex: "male",
      height: 172,
      weight: 78,
      activityLevel: "medium",
      phone: "08123456789",
      email: "budi.santoso@gmail.com",
    },
    {
      id: "p-2",
      code: "PAT-002",
      name: "Siti Rahma",
      dob: "1970-03-22",
      sex: "female",
      height: 158,
      weight: 64,
      activityLevel: "light",
      phone: "08198765432",
      email: "siti.rahma@yahoo.com",
    },
  ];
};

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: getStoredPatients(),
  activePatientId: getStoredPatients()[0]?.id || null,

  addPatient: (patient) =>
    set((state) => {
      const updated = [...state.patients, patient];
      localStorage.setItem("nutrisurvey_patients", JSON.stringify(updated));
      return { patients: updated, activePatientId: patient.id };
    }),

  updatePatient: (id, data) =>
    set((state) => {
      const updated = state.patients.map((p) =>
        p.id === id ? { ...p, ...data } : p
      );
      localStorage.setItem("nutrisurvey_patients", JSON.stringify(updated));
      return { patients: updated };
    }),

  deletePatient: (id) =>
    set((state) => {
      const updated = state.patients.filter((p) => p.id !== id);
      localStorage.setItem("nutrisurvey_patients", JSON.stringify(updated));
      let nextActiveId = state.activePatientId;
      if (nextActiveId === id) {
        nextActiveId = updated.length > 0 ? updated[0].id : null;
      }
      return { patients: updated, activePatientId: nextActiveId };
    }),

  setActivePatient: (id) =>
    set(() => ({
      activePatientId: id,
    })),

  calculateBMR: (patient, method) => {
    const { weight, height, dob, sex } = patient;
    const age = calculateAge(dob);

    if (method === "harris") {
      return sex === "male"
        ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
        : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    } else if (method === "mifflin") {
      return sex === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    } else if (method === "who") {
      // WHO formula based on age & gender (Age 18-30 default, expanding for common ranges)
      if (sex === "male") {
        if (age >= 18 && age < 30) return 15.3 * weight + 679;
        if (age >= 30 && age < 60) return 11.6 * weight + 879;
        return 13.5 * weight + 487; // age >= 60
      } else {
        if (age >= 18 && age < 30) return 14.7 * weight + 496;
        if (age >= 30 && age < 60) return 8.7 * weight + 829;
        return 10.5 * weight + 596; // age >= 60
      }
    }
    return 10 * weight + 6.25 * height - 5 * age + 5; // default to mifflin male
  },

  calculateTDEE: (bmr, activity) => {
    const factors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      medium: 1.55,
      heavy: 1.725,
      veryHeavy: 1.9,
    };
    return bmr * (factors[activity] || 1.2);
  },

  calculateBMI: (weight, height) => {
    if (!weight || !height) return 0;
    const hM = height / 100;
    return parseFloat((weight / (hM * hM)).toFixed(1));
  },

  getBMIColor: (bmi) => {
    if (!bmi) return "text-zinc-400 bg-zinc-900";
    if (bmi < 18.5) return "text-amber-400 bg-amber-950/20 border-amber-500/30";
    if (bmi < 25) return "text-emerald-400 bg-emerald-950/20 border-emerald-500/30";
    if (bmi < 30) return "text-orange-400 bg-orange-950/20 border-orange-500/30";
    return "text-rose-400 bg-rose-950/20 border-rose-500/30";
  },

  getBMICategory: (bmi) => {
    if (!bmi) return "N/A";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal Weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  },
}));
