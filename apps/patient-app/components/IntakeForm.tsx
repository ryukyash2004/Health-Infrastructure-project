"use client";

import { useState } from 'react';
import { useStore, IntakeData } from '../store/useStore';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  User, 
  Activity, 
  Stethoscope, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Demographics', icon: User },
  { id: 2, title: 'Medical History', icon: Activity },
  { id: 3, title: 'Lifestyle', icon: Stethoscope },
  { id: 4, title: 'Safety', icon: ShieldCheck },
];

export default function IntakeForm() {
  const { setIntakeData, isIntakeModalOpen } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeData>({
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    contactNumber: '',
    conditions: [],
    otherIllness: '',
    sleepCycle: '',
    badHabits: [],
    bowelMovement: '',
    allergies: [],
    allergyDetails: '',
    vaccinations: [],
  });

  if (!isIntakeModalOpen) return null;

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleToggle = (field: keyof IntakeData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      nextStep();
    } else {
      setIntakeData(formData);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Progress Header */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Pre-Consultation</h2>
              <p className="text-gray-500 text-sm font-bold">Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              {(() => {
                const Icon = STEPS[currentStep - 1].icon;
                return <Icon className="w-6 h-6" />;
              })()}
            </div>
          </div>
          
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 pt-4">
          
          {/* Step 1: Demographics */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="28"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                  <select 
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select 
                    required
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact</label>
                  <input 
                    required
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="+91 987..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Past Medical History */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Existing Conditions</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Hypertension', 'Diabetes', 'Asthma', 'Thyroid'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleToggle('conditions', cond)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-xs font-black ${
                        formData.conditions.includes(cond)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${formData.conditions.includes(cond) ? 'bg-white/20 border-white/40' : 'bg-white border-gray-200'}`}>
                        {formData.conditions.includes(cond) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Other History</label>
                <textarea 
                  value={formData.otherIllness}
                  onChange={(e) => setFormData({ ...formData, otherIllness: e.target.value })}
                  placeholder="Any surgeries, chronic illnesses, or hospitalizations..."
                  className="w-full h-32 bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Average Sleep Cycle</label>
                <select 
                  required
                  value={formData.sleepCycle}
                  onChange={(e) => setFormData({ ...formData, sleepCycle: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Sleep Hours</option>
                  <option value="Less than 5 hrs">Less than 5 hrs</option>
                  <option value="6-8 hrs">6-8 hrs</option>
                  <option value="More than 8 hrs">More than 8 hrs</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Habits</label>
                <div className="flex flex-wrap gap-2">
                  {['Smoking', 'Alcohol', 'None'].map((habit) => (
                    <button
                      key={habit}
                      type="button"
                      onClick={() => handleToggle('badHabits', habit)}
                      className={`px-6 py-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${
                        formData.badHabits.includes(habit)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-blue-200'
                      }`}
                    >
                      {habit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bowel Movement</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Regular', 'Constipated', 'Irregular'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, bowelMovement: type })}
                      className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${
                        formData.bowelMovement === type
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-blue-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Safety (Allergies & Vaccinations) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Known Allergies
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Drug', 'Food', 'Environment'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggle('allergies', type)}
                      className={`px-6 py-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${
                        formData.allergies.includes(type)
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100'
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-red-200'
                      }`}
                    >
                      {type} Allergy
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  value={formData.allergyDetails}
                  onChange={(e) => setFormData({ ...formData, allergyDetails: e.target.value })}
                  placeholder="Specify allergic reactions (e.g. Skin rash, sneezing)..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-red-600 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Key Vaccinations</label>
                <div className="space-y-2">
                  {['COVID-19', 'Tetanus', 'Hepatitis B'].map((vaccine) => (
                    <button
                      key={vaccine}
                      type="button"
                      onClick={() => handleToggle('vaccinations', vaccine)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        formData.vaccinations.includes(vaccine)
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-gray-50 border-gray-100 text-gray-500'
                      }`}
                    >
                      <span className="text-xs font-black">{vaccine} Vaccine</span>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        formData.vaccinations.includes(vaccine) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-transparent'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-10">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              type="submit"
              className={`px-8 py-5 bg-blue-600 text-white rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${currentStep === 1 ? 'w-full' : 'flex-[2]'}`}
            >
              {currentStep === STEPS.length ? 'Finalize Profile' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
