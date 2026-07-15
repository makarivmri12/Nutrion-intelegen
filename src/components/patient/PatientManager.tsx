import React, { useState, useEffect } from "react";
import { usePatientStore, Patient, calculateAge } from "../../store/usePatientStore";
import { useNutriStore } from "../../store/useNutriStore";
import { 
  Plus, 
  Trash2, 
  User, 
  Activity, 
  Layers, 
  Calculator, 
  Phone, 
  Mail, 
  Calendar, 
  Scale, 
  Ruler, 
  HeartHandshake,
  Check,
  RefreshCw,
  Clock
} from "lucide-react";

export default function PatientManager() {
  const {
    patients,
    activePatientId,
    addPatient,
    updatePatient,
    deletePatient,
    setActivePatient,
    calculateBMR,
    calculateTDEE,
    calculateBMI,
    getBMIColor,
    getBMICategory
  } = usePatientStore();

  const { updatePatientProfile } = useNutriStore();

  // Selected patient
  const activePatient = patients.find(p => p.id === activePatientId) || null;

  // Form states for adding / editing patient
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // BMR Method selection for display
  const [bmrMethod, setBmrMethod] = useState("mifflin");

  // Sync to form when active patient changes
  useEffect(() => {
    if (activePatient) {
      setName(activePatient.name);
      setCode(activePatient.code);
      setDob(activePatient.dob);
      setSex(activePatient.sex);
      setHeight(activePatient.height);
      setWeight(activePatient.weight);
      setActivityLevel(activePatient.activityLevel);
      setPhone(activePatient.phone || "");
      setEmail(activePatient.email || "");

      // Synchronize with standard useNutriStore as well
      updatePatientProfile({
        name: activePatient.name,
        age: calculateAge(activePatient.dob),
        gender: activePatient.sex === "male" ? "Male" : "Female",
        height: activePatient.height,
        weight: activePatient.weight,
        activityLevel: activePatient.activityLevel === "sedentary" ? "Sedentary" 
          : activePatient.activityLevel === "light" ? "Lightly Active" 
          : activePatient.activityLevel === "medium" ? "Moderately Active" : "Very Active"
      });
    }
  }, [activePatientId, activePatient]);

  // Handle Save / Submit
  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientData = {
      name: name.trim(),
      code: code.trim() || `PAT-${Date.now().toString().slice(-4)}`,
      dob,
      sex,
      height,
      weight,
      activityLevel,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined
    };

    if (isAdding) {
      const newId = `pat-${Date.now()}`;
      addPatient({
        id: newId,
        ...patientData
      });
      setIsAdding(false);
    } else if (activePatient) {
      updatePatient(activePatient.id, patientData);
      setIsEditing(false);
    }
  };

  const handleCreateNewTrigger = () => {
    setName("");
    setCode(`PAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setDob("1995-01-01");
    setSex("male");
    setHeight(170);
    setWeight(70);
    setActivityLevel("sedentary");
    setPhone("");
    setEmail("");
    setIsAdding(true);
    setIsEditing(false);
  };

  // Live calculator helper variables for the active form values
  const liveBmi = calculateBMI(weight, height);
  const liveBmrMifflin = calculateBMR({ name, weight, height, dob, sex, activityLevel }, "mifflin");
  const liveBmrHarris = calculateBMR({ name, weight, height, dob, sex, activityLevel }, "harris");
  const liveBmrWho = calculateBMR({ name, weight, height, dob, sex, activityLevel }, "who");

  const selectedLiveBmr = bmrMethod === "mifflin" ? liveBmrMifflin 
    : bmrMethod === "harris" ? liveBmrHarris 
    : liveBmrWho;

  const liveTdee = calculateTDEE(selectedLiveBmr, activityLevel);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 font-sans text-zinc-300" id="patient-manager-container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-mono flex items-center space-x-2">
            <User className="w-4 h-4 text-[#00d4ff]" />
            <span>Clinical Patient Lifecycle & Metabolic Registry</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure anthropometric data, view real-time metabolic rate estimates (BMR/TDEE) and synchronize clinical targets.
          </p>
        </div>

        <button
          onClick={handleCreateNewTrigger}
          className="py-1.5 px-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-xs rounded flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Patients List */}
        <div className="bg-[#121212] border border-[#27272a] rounded-lg p-3 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block px-2.5 mb-2">
            Active Records
          </span>

          <div className="space-y-1">
            {patients.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setActivePatient(p.id);
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className={`p-3 rounded text-xs transition-all cursor-pointer flex items-center justify-between group border ${
                  activePatientId === p.id && !isAdding
                    ? "bg-[#00d4ff]/10 border-[#00d4ff]/30 text-white font-medium"
                    : "border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-white"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-semibold text-white">{p.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{p.code} • {calculateAge(p.dob)} Thn</span>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus catatan pasien ${p.name}?`)) {
                        deletePatient(p.id);
                      }
                    }}
                    className="p-1 hover:text-red-400 rounded hover:bg-zinc-800"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area: Form & Live Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form Area */}
          {(isAdding || isEditing || activePatient) && (
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white tracking-wider font-mono uppercase flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-[#00d4ff]" />
                  <span>{isAdding ? "Register Clinical Patient Profile" : "Anthropometric Data Form"}</span>
                </h3>
                {activePatient && !isAdding && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] uppercase rounded border border-zinc-700 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePatient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      disabled={!isAdding && !isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Patient Registry ID</label>
                    <input
                      type="text"
                      disabled={!isAdding && !isEditing}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="PAT-1002"
                      className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Date of Birth *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="date"
                        required
                        disabled={!isAdding && !isEditing}
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Sex */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Sex *</label>
                    <select
                      disabled={!isAdding && !isEditing}
                      value={sex}
                      onChange={(e) => setSex(e.target.value as any)}
                      className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] disabled:opacity-50 cursor-pointer"
                    >
                      <option value="male">Male (Laki-laki)</option>
                      <option value="female">Female (Perempuan)</option>
                    </select>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Height (cm) *</label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="number"
                        required
                        disabled={!isAdding && !isEditing}
                        value={height}
                        onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-10 pr-3 py-2 text-xs text-white font-mono text-right focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Weight (kg) *</label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="number"
                        required
                        disabled={!isAdding && !isEditing}
                        value={weight}
                        onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-10 pr-3 py-2 text-xs text-white font-mono text-right focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Activity Level</label>
                    <select
                      disabled={!isAdding && !isEditing}
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#27272a] rounded p-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] disabled:opacity-50 cursor-pointer"
                    >
                      <option value="sedentary">Sedentary (TIDAK AKTIF)</option>
                      <option value="light">Light Work (RINGAN)</option>
                      <option value="medium">Medium Active (SEDANG)</option>
                      <option value="heavy">Heavy Work (BERAT)</option>
                      <option value="veryHeavy">Very Heavy (SANGAT BERAT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        disabled={!isAdding && !isEditing}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0812xxxxxxxx"
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="email"
                        disabled={!isAdding && !isEditing}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. patient@domain.com"
                        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {(isAdding || isEditing) && (
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded bg-[#00d4ff] hover:bg-[#00b4df] text-black font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Save Patient Record
                    </button>
                  </div>
                )}
              </form>

              {/* Live Calculator Board / Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                {/* BMI card */}
                <div className={`p-4 rounded-lg border flex flex-col justify-between ${getBMIColor(liveBmi)}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Body Mass Index</span>
                      <Activity className="w-4 h-4" />
                    </div>
                    <p className="text-3xl font-bold font-mono tracking-tight mt-2">{liveBmi || "0.0"}</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider block opacity-70">Category</span>
                    <span className="text-xs font-semibold">{getBMICategory(liveBmi)}</span>
                  </div>
                </div>

                {/* BMR card with Method Selection */}
                <div className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Basal Metabolic Rate</span>
                      <Layers className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold font-mono tracking-tight text-white mt-2">
                      {selectedLiveBmr} <span className="text-xs font-normal text-zinc-500">kcal</span>
                    </p>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">BMR Formula Model</span>
                    <div className="grid grid-cols-3 gap-1">
                      {["mifflin", "harris", "who"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setBmrMethod(m)}
                          className={`py-1 text-[9px] font-mono font-medium rounded text-center border capitalize transition-colors ${
                            bmrMethod === m 
                              ? "bg-purple-950/20 text-purple-400 border-purple-500/30" 
                              : "bg-zinc-900 text-zinc-500 border-transparent hover:text-zinc-300"
                          }`}
                        >
                          {m === "mifflin" ? "Mifflin" : m === "harris" ? "Harris" : "WHO"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TDEE card */}
                <div className="bg-[#1a1a1a] border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Daily Energy (TDEE)</span>
                      <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold font-mono tracking-tight text-white mt-2">
                      {Math.round(liveTdee)} <span className="text-xs font-normal text-zinc-500">kcal</span>
                    </p>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Metabolic multiplier</span>
                    <span className="text-xs text-zinc-300 font-mono font-semibold">
                      {activityLevel === "sedentary" ? "Sedentary (1.2x)" 
                        : activityLevel === "light" ? "Lightly Active (1.375x)" 
                        : activityLevel === "medium" ? "Moderately Active (1.55x)"
                        : activityLevel === "heavy" ? "Heavy Active (1.725x)" : "Very Active (1.9x)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
