"use client";

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function IntakeForm() {
  const { setPatientHistory, setIntakeComplete } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    contactNumber: '',
    // Step 2
    conditions: {
      hypertension: false,
      diabetes: false,
      asthma: false,
      thyroid: false
    },
    otherHistory: '',
    // Step 3
    sleepCycle: '',
    badHabits: {
      smoking: false,
      alcohol: false
    },
    bowelMovement: '',
    // Step 4
    allergies: {
      drug: false,
      food: false,
      environment: false
    },
    allergyReaction: '',
    vaccinations: {
      covid19: false,
      tetanus: false,
      hepatitisB: false
    }
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Compile data into a formatted string
    const historyParts = [];
    historyParts.push(`Name: ${formData.fullName}`);
    historyParts.push(`Age: ${formData.age}`);
    historyParts.push(`Gender: ${formData.gender}`);
    historyParts.push(`Blood Group: ${formData.bloodGroup}`);
    
    const conditions = Object.entries(formData.conditions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
    if (conditions) historyParts.push(`Conditions: ${conditions}`);
    if (formData.otherHistory) historyParts.push(`Other History: ${formData.otherHistory}`);
    
    historyParts.push(`Sleep: ${formData.sleepCycle}`);
    
    const habits = Object.entries(formData.badHabits)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
    if (habits) historyParts.push(`Habits: ${habits}`);
    
    historyParts.push(`Bowel: ${formData.bowelMovement}`);
    
    const allergies = Object.entries(formData.allergies)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
    if (allergies) historyParts.push(`Allergies: ${allergies} (${formData.allergyReaction})`);
    
    const vaccines = Object.entries(formData.vaccinations)
      .filter(([_, value]) => value)
      .map(([key, _]) => key === 'covid19' ? 'COVID-19' : key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
    if (vaccines) historyParts.push(`Vaccines: ${vaccines}`);

    const finalHistoryString = historyParts.join(' | ');
    setPatientHistory(finalHistoryString);
    setIntakeComplete(true);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-4xl lg:max-w-5xl md:mx-auto md:shadow-2xl overflow-hidden md:my-10 md:rounded-3xl">
      {/* Progress Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Pre-Consultation</h2>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step {step} of 4</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Step 1: Basic Demographics */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Basic Demographics</h3>
              <p className="text-sm text-slate-500">Please provide your basic information to get started.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    required
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                    placeholder="28"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select 
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all appearance-none"
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select 
                    required
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all appearance-none"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Past Medical History */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Medical History</h3>
              <p className="text-sm text-slate-500">Do you have any pre-existing medical conditions?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['hypertension', 'diabetes', 'asthma', 'thyroid'].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData({
                    ...formData, 
                    conditions: {...formData.conditions, [cond]: !formData.conditions[cond as keyof typeof formData.conditions]}
                  })}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
                    formData.conditions[cond as keyof typeof formData.conditions]
                    ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    formData.conditions[cond as keyof typeof formData.conditions] ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'
                  }`}>
                    {formData.conditions[cond as keyof typeof formData.conditions] && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Other history, surgeries, or medications</label>
              <textarea 
                value={formData.otherHistory}
                onChange={(e) => setFormData({...formData, otherHistory: e.target.value})}
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="List any past surgeries or other illnesses..."
              />
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle & Generals */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Lifestyle & Habits</h3>
              <p className="text-sm text-slate-500">Help us understand your daily routine.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Average Sleep Cycle</label>
                <div className="grid grid-cols-3 gap-2">
                  {['<5 hrs', '6-8 hrs', '>8 hrs'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, sleepCycle: val})}
                      className={`py-2.5 rounded-lg border text-xs font-bold transition-all ${
                        formData.sleepCycle === val
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Bad Habits</label>
                <div className="flex gap-4">
                  {['smoking', 'alcohol'].map((habit) => (
                    <label key={habit} className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.badHabits[habit as keyof typeof formData.badHabits]}
                        onChange={() => setFormData({
                          ...formData, 
                          badHabits: {...formData.badHabits, [habit]: !formData.badHabits[habit as keyof typeof formData.badHabits]}
                        })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize group-hover:text-blue-600">{habit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Bowel Movement</label>
                <select 
                  required
                  value={formData.bowelMovement}
                  onChange={(e) => setFormData({...formData, bowelMovement: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="">Select</option>
                  <option value="Regular">Regular</option>
                  <option value="Constipated">Constipated</option>
                  <option value="Irregular">Irregular</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Allergies & Vaccinations */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Safety & Vaccinations</h3>
              <p className="text-sm text-slate-500">Final checks before starting the triage.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Known Allergies</label>
                <div className="flex flex-wrap gap-4">
                  {['drug', 'food', 'environment'].map((type) => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.allergies[type as keyof typeof formData.allergies]}
                        onChange={() => setFormData({
                          ...formData, 
                          allergies: {...formData.allergies, [type]: !formData.allergies[type as keyof typeof formData.allergies]}
                        })}
                        className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize group-hover:text-red-600">{type} Allergy</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <input 
                type="text" 
                value={formData.allergyReaction}
                onChange={(e) => setFormData({...formData, allergyReaction: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Specify the reaction (e.g. Skin rash, swelling)..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Vaccination Status</label>
              <div className="space-y-2">
                {[
                  { id: 'covid19', label: 'COVID-19 Vaccine' },
                  { id: 'tetanus', label: 'Tetanus' },
                  { id: 'hepatitisB', label: 'Hepatitis B' }
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setFormData({
                      ...formData, 
                      vaccinations: {...formData.vaccinations, [v.id]: !formData.vaccinations[v.id as keyof typeof formData.vaccinations]}
                    })}
                    className={`flex items-center justify-between w-full p-4 rounded-xl border text-sm font-bold transition-all ${
                      formData.vaccinations[v.id as keyof typeof formData.vaccinations]
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700 ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {v.label}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      formData.vaccinations[v.id as keyof typeof formData.vaccinations] ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'
                    }`}>
                      {formData.vaccinations[v.id as keyof typeof formData.vaccinations] && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Navigation Footer */}
      <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/50 backdrop-blur">
        {step > 1 && (
          <button 
            type="button"
            onClick={prevStep}
            className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        
        {step < 4 ? (
          <button 
            type="button"
            onClick={nextStep}
            className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            Finalize Profile <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
