"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Pill, 
  Microscope, 
  FileBarChart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  Plus, 
  Trash2, 
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarDays,
  History,
  ClipboardList,
  Search,
  User,
  Activity,
  FileText,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import MedicalAutocomplete from '../components/MedicalAutocomplete';

// --- Types ---
interface Medicine {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Differential {
  id: string;
  diagnosis: string;
  reason: string;
  investigation: string;
}

export default function DoctorDashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: 'Metformin 500mg', dose: '1 tablet', frequency: 'Twice daily', duration: '14 Days', instructions: 'After meals' }
  ]);
  
  const [differentials, setDifferentials] = useState<Differential[]>([
    { id: '1', diagnosis: 'Acute Gastritis', reason: 'Epigastric tenderness, relationship with spicy food', investigation: 'H. pylori Breath Test' }
  ]);

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), name: '', dose: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const addDifferential = () => {
    setDifferentials([...differentials, { id: Date.now().toString(), diagnosis: '', reason: '', investigation: '' }]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      
      {/* PART 1: THE SHELL - Left Sidebar Navigation (Flat) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight uppercase">Aegis Health</span>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Overview' },
            { icon: Users, label: 'Patients', active: true },
            { icon: Calendar, label: 'Appointments' },
            { icon: Pill, label: 'Prescriptions' },
            { icon: Microscope, label: 'Investigations' },
            { icon: FileBarChart, label: 'Reports' },
            { icon: MessageSquare, label: 'Messages' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${item.active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors text-left">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 ml-64 flex flex-col min-w-0 w-full">
        
        {/* PART 1: THE SHELL - Top Sticky Header (Flat) */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between w-full">
          <h1 className="text-lg font-bold text-slate-800">Doctor Dashboard</h1>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-none mb-1">Dr. Sarah Connor</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-none">MBBS, MD</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm">
                SC
              </div>
            </div>
          </div>
        </header>

        {/* Scrolling Area */}
        <div className="p-6 md:p-8 space-y-6 pb-32 w-full">
          
          {/* PART 1: THE SHELL - Patient Context Bar (Flattened) */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0">
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl border border-slate-200 shadow-inner shrink-0">
                PS
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900 leading-none truncate">Priya Sharma</h2>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-bold uppercase tracking-widest shrink-0">PID: AE-99201</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 opacity-70" /> 28 Yrs / Female</span>
                  <span className="flex items-center gap-1.5 font-mono"><Clock className="w-4 h-4 opacity-70" /> +91 98765 43210</span>
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 opacity-70" /> Visit: 24 Oct 2024, 10:30 AM</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded uppercase border border-blue-100">OPD Consultation</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <button className="px-4 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">View Medical History</button>
              <button className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Patient Vitals</button>
            </div>
          </section>

          {/* PART 1: THE SHELL - AI Triage Handoff Banner (Flattened & Full Width) */}
          <section className="bg-red-50 border border-red-100 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 w-full">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-2.5 bg-white border border-red-200 rounded-lg shadow-sm">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-red-800 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                  AI Triage Handoff Summary
                  <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 rounded text-red-600 uppercase border border-red-200">Read-Only</span>
                </h3>
                <p className="text-base font-bold text-red-900 tracking-tight">Severity Level 3: Moderate Clinical Risk Detected</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <span className="text-xs font-black text-red-700 uppercase tracking-widest mr-1">AI Differential:</span>
              {['Acute Gastritis', 'Biliary Colic', 'PUD', 'GERD'].map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-white border border-red-200 text-red-700 text-xs font-black rounded-lg shadow-sm hover:bg-red-50 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* PART 2: THE 11-SECTION DOCTOR FORM (Responsive Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            
            {/* 1. Patient Complaint (Full Width on mobile/tablet, spans half on desktop) */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-50 rounded-lg"><MessageSquare className="w-4 h-4 text-blue-600" /></div>
                1. Patient Complaint
              </h4>
              <textarea 
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="Chief complaints with duration..."
                defaultValue="Patient reports persistent epigastric pain for 3 days, described as 'burning' and 'bloating'. Pain is worse 1 hour after dinner. Associated with acid reflux."
              />
            </div>

            {/* 2. History of Present Illness */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-50 rounded-lg"><Clock className="w-4 h-4 text-blue-600" /></div>
                2. History of Present Illness
              </h4>
              <textarea 
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="Clinical evolution of symptoms..."
                defaultValue="Onset was gradual after a heavy spicy meal. Partially relieved by milk and antacids. No history of vomiting, melena, or weight loss. Workplace stress is high."
              />
            </div>

            {/* 3. Past History */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-50 rounded-lg"><History className="w-4 h-4 text-blue-600" /></div>
                3. Past History
              </h4>
              <div className="space-y-2.5">
                {['Hypertension', 'Diabetes Type 2', 'Asthma'].map(item => (
                  <label key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all shadow-sm" />
                    {item}
                  </label>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Other Medical History</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" defaultValue="Appendectomy (2018)" />
              </div>
            </div>

            {/* 4. Vaccination Taken */}
            <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                4. Vaccination Taken
              </h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Vaccine Name</th>
                      <th className="text-left py-4 px-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Dose / Date</th>
                      <th className="text-left py-4 px-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {[
                      { v: 'COVID-19 (Covishield)', d: '3rd Dose / 12-05-2022', s: 'Complete' },
                      { v: 'Hepatitis B', d: 'Booster / Pending', s: 'Incomplete' },
                      { v: 'Influenza (Annual)', d: 'Scheduled Oct 2024', s: 'Due Soon' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">{row.v}</td>
                        <td className="py-4 px-6 text-slate-500 font-mono">{row.d}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            row.s === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{row.s}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Generals (Responsive Multi-Column) */}
            <div className="col-span-full bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-50 rounded-lg"><Activity className="w-4 h-4 text-blue-600" /></div>
                5. Generals & Lifestyle
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[
                  { l: 'Appearance', v: 'Conscious, Oriented, No Pallor' },
                  { l: 'Appetite', v: 'Poor (Reduced)' },
                  { l: 'Sleep Cycle', v: 'Disturbed due to acidity' },
                  { l: 'Bowel Movement', v: 'Regular, Once daily' },
                  { l: 'Urine', v: 'Normal frequency' },
                  { l: 'Perspiration', v: 'Normal' },
                  { l: 'Bad Habits', v: 'Occasional Alcohol, Non-Smoker' },
                  { l: 'Lifestyle Note', v: 'Patient appears anxious' }
                ].map((item) => (
                  <div key={item.l} className="space-y-2 p-4 bg-slate-50/50 border border-slate-100 rounded-xl focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-sm">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.l}</label>
                    <input type="text" className="w-full bg-transparent border-none text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300" defaultValue={item.v} />
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Allergies */}
            <div className="col-span-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider text-red-600">
                <div className="p-1.5 bg-red-50 rounded-lg"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                6. Allergies
              </h4>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full lg:w-auto shrink-0">
                  {['Peanuts', 'Penicillin', 'Latex'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-red-500 focus:ring-red-500 transition-all shadow-sm" />
                      <span className="group-hover:text-red-600 transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="flex-1 w-full">
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all shadow-inner" placeholder="Describe specific reactions or other documented allergies..." defaultValue="Mild skin rash reported with Ibuprofen in 2019." />
                </div>
              </div>
            </div>

            {/* 7. Investigations Done */}
            <div className="col-span-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><Microscope className="w-4 h-4 text-blue-600" /></div>
                  7. Investigations Done
                </h4>
                <div className="flex p-1 bg-slate-200/50 rounded-lg border border-slate-200">
                  <button className="px-6 py-2 bg-white text-blue-600 text-xs font-black uppercase tracking-widest rounded-md shadow-sm">Tests</button>
                  <button className="px-6 py-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Reports</button>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full min-w-[800px] text-xs">
                  <thead className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-left">Investigation / Test Name</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-left">Date</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-left">Key Findings / Result Summary</th>
                      <th className="py-4 px-6 font-black uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {[
                      { t: 'Complete Blood Count (CBC)', d: '22-10-2024', r: 'Hb 12.8, WBC 8400 (Within Normal Range)' },
                      { t: 'Liver Function Test (LFT)', d: '22-10-2024', r: 'Mild elevation in ALT (45 U/L). Other parameters normal.' },
                      { t: 'USG Upper Abdomen', d: '23-10-2024', r: 'No gallstones. Mild fatty liver changes noted.' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-4 px-6">{row.t}</td>
                        <td className="py-4 px-6 text-slate-500 font-mono">{row.d}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium italic">{row.r}</td>
                        <td className="py-4 px-6 text-right">
                          <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest border border-blue-100">View File</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 8. Differential Diagnosis */}
            <div className="col-span-full xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><ClipboardList className="w-4 h-4 text-blue-600" /></div>
                  8. Differential Diagnosis
                </h4>
                <button onClick={addDifferential} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                  <Plus className="w-4 h-4" /> Add Diagnosis Row
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner">
                <table className="w-full min-w-[900px] text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="py-4 px-6">Clinical Diagnosis</th>
                      <th className="py-4 px-6">Probable Reason / Etiology</th>
                      <th className="py-4 px-6">Investigations Suggested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {differentials.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-900 focus:text-blue-600" defaultValue={row.diagnosis} placeholder="Enter diagnosis..." />
                        </td>
                        <td className="py-4 px-6">
                          <input type="text" className="w-full bg-transparent outline-none text-slate-500 font-medium" defaultValue={row.reason} placeholder="Enter reason..." />
                        </td>
                        <td className="py-4 px-6">
                          <input type="text" className="w-full bg-transparent outline-none text-blue-600 font-black italic text-[13px]" defaultValue={row.investigation} placeholder="Enter investigation..." />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 9. Final Diagnosis */}
            <div className="col-span-full xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-emerald-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                9. Final Diagnosis
              </h4>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Standardized ICD-10 Code</label>
                  <MedicalAutocomplete 
                    type="icd10" 
                    onSelect={(val) => console.log('ICD-10:', val)}
                    placeholder="Search ICD-10 Code..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Clinical Assessment Note</label>
                  <textarea 
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all resize-none shadow-inner"
                    placeholder="Provide final clinical assessment summary..."
                    defaultValue="Acute Non-Atrophic Gastritis (K29.7). Symptoms consistent with NSAID overuse and stress. Ruling out H. pylori infection."
                  />
                </div>
              </div>
            </div>

            {/* 10. Prescriptions (Full Width) */}
            <div className="col-span-full bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 border-b border-slate-100 pb-6">
                <h4 className="text-base font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                  <div className="p-1.5 bg-blue-50 rounded-lg"><Pill className="w-5 h-5 text-blue-600" /></div>
                  10. Prescription Chart
                </h4>
                <button onClick={addMedicine} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
                  <Plus className="w-5 h-5" /> Add New Medication
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner">
                <table className="w-full min-w-[1000px] text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="py-5 px-6 min-w-[300px]">Medicine / Drug Formula</th>
                      <th className="py-5 px-6">Dosage</th>
                      <th className="py-5 px-6">Frequency</th>
                      <th className="py-5 px-6">Duration</th>
                      <th className="py-5 px-6">Special Instructions</th>
                      <th className="py-5 px-6 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map((med) => (
                      <tr key={med.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-6">
                          <MedicalAutocomplete 
                            type="rxnorm" 
                            onSelect={(val) => console.log('Medicine:', val)}
                            defaultValue={med.name}
                            className="font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-800" defaultValue={med.dose} placeholder="e.g. 1 Tablet" />
                        </td>
                        <td className="py-3 px-6">
                          <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-800" defaultValue={med.frequency} placeholder="e.g. 1-0-1" />
                        </td>
                        <td className="py-3 px-6">
                          <input type="text" className="w-full bg-transparent outline-none font-black text-blue-600" defaultValue={med.duration} placeholder="e.g. 14 Days" />
                        </td>
                        <td className="py-3 px-6 text-slate-500 font-medium italic">
                          <input type="text" className="w-full bg-transparent outline-none" defaultValue={med.instructions} placeholder="e.g. After Food" />
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button onClick={() => removeMedicine(med.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50 shadow-sm">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> Notes for Pharmacist / Patient Guidance
                </label>
                <textarea 
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                  placeholder="Special usage instructions or drug interaction warnings..."
                  defaultValue="Avoid alcohol and excessive caffeine while on medication. Take Pantoprazole 30 mins before breakfast."
                />
              </div>
            </div>

            {/* 11. Follow Ups */}
            <div className="col-span-full bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-8">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-wider">
                <div className="p-1.5 bg-blue-50 rounded-lg"><CalendarDays className="w-4 h-4 text-blue-600" /></div>
                11. Continuity of Care (Follow Ups)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Scheduled Follow-up Date</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3.5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all cursor-pointer shadow-sm" defaultValue="2024-11-01" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Estimated Time Slot</label>
                  <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3.5 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all cursor-pointer shadow-sm" defaultValue="10:30" />
                </div>
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Consultation Mode</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3.5 text-sm font-black text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-sm">
                    <option>Physical Visit (OPD)</option>
                    <option>Video Consultation (Online)</option>
                    <option>Home Visit (Special)</option>
                    <option>IPD Regular Review</option>
                  </select>
                  <ChevronDown className="absolute right-6 bottom-4 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Patient Monitoring Instructions</label>
                  <textarea 
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                    placeholder="What to monitor or specific diet modifications before next visit..."
                    defaultValue="Return immediately if pain radiates to the back or high-grade fever occurs. Maintain a light bland diet for 1 week."
                  />
                </div>
                <div className="col-span-full">
                  <label className="flex items-center gap-4 p-6 rounded-2xl bg-blue-50 border border-blue-100 cursor-pointer w-fit group shadow-sm transition-all hover:bg-white hover:border-blue-300">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer shadow-inner" defaultChecked />
                    <span className="text-sm font-black text-blue-900 group-hover:text-blue-600">Send automated secure HIPAA reminders to patient via WhatsApp and Email</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PART 4: BOTTOM ACTION BAR (Flat Sticky Full Width) */}
        <footer className="fixed bottom-0 right-0 left-64 bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 z-40">
          <div className="max-w-[1600px] mx-auto flex items-center justify-end gap-4 px-4">
            <button className="px-8 py-3.5 border-2 border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95 shadow-sm">
              Save Draft
            </button>
            <button className="px-8 py-3.5 border-2 border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 shadow-sm">
              Clear All
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <button className="px-12 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 border border-white/10 hover:scale-[1.02]">
              Save & Complete Visit
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
