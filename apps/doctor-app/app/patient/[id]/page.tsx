"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarDays,
  History,
  ClipboardList,
  Activity,
  Stethoscope,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import MedicalAutocomplete from '../../../components/MedicalAutocomplete';

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

interface PatientData {
  id: string;
  db_id: number;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  contact: string;
  visit_date: string;
  visit_type: string;
  clinical_data: {
    patient_complaint: string;
    history_of_present_illness: string;
    past_history: string[];
    ai_assessment: {
      severity_level: number;
      differential_diagnosis: string[];
    };
  };
}

export default function PatientDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: '1', name: 'Metformin 500mg', dose: '1 tablet', frequency: 'Twice daily', duration: '14 Days', instructions: 'After meals' }
  ]);
  
  const [differentials, setDifferentials] = useState<Differential[]>([
    { id: '1', diagnosis: 'Acute Gastritis', reason: 'Epigastric tenderness, relationship with spicy food', investigation: 'H. pylori Breath Test' }
  ]);

  const fetchPatientData = useCallback(async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/v1/patients/${patientId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Patient record not found in database.');
        throw new Error('Failed to fetch patient data');
      }
      const data = await response.json();
      setPatient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPatientData(id);
    }
  }, [id, fetchPatientData]);

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), name: '', dose: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const addDifferential = () => {
    setDifferentials([...differentials, { id: Date.now().toString(), diagnosis: '', reason: '', investigation: '' }]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg font-medium text-slate-600 animate-pulse">Loading patient record #{id}...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col items-center text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Patient Not Found</h2>
          <p className="text-slate-500">We couldn't find a patient record with ID <span className="font-bold text-slate-900">#{id}</span>. It might have been deleted or the ID is incorrect.</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      
      {/* PART 1: THE SHELL - Left Sidebar Navigation (Flat) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Stethoscope className="text-white w-5 h-5" />
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
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 ml-64 flex flex-col min-w-0">
        
        {/* PART 1: THE SHELL - Top Sticky Header (Flat) */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">Patient Medical Record</h1>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Dr. Sarah Connor</p>
                <p className="text-[10px] text-slate-500 font-medium">MBBS, MD</p>
              </div>
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                SC
              </div>
            </div>
          </div>
        </header>

        {/* Scrolling Area */}
        <div className="p-8 space-y-6 pb-32 max-w-6xl mx-auto w-full">
          
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* PART 1: THE SHELL - Patient Context Bar (Flattened) */}
            <section className="bg-white rounded border border-slate-200 shadow-sm p-5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl border border-slate-200">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-bold text-slate-900 leading-none">{patient.name}</h2>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-medium uppercase tracking-wider">{patient.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>{patient.age || '??'} Yrs / {patient.gender}</span>
                    <span>{patient.contact}</span>
                    <span>Visit: {patient.visit_date}</span>
                    <span className="text-blue-600 font-bold">{patient.visit_type}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded hover:bg-slate-50 transition-colors">History</button>
                <button className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded hover:bg-slate-50 transition-colors">Vitals</button>
              </div>
            </section>

            {/* PART 1: THE SHELL - AI Triage Handoff Banner (Flattened & Soft Red) */}
            <section className={`${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} border rounded p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded ${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <AlertTriangle className={`w-5 h-5 ${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'text-red-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 ${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'text-red-800' : 'text-amber-800'}`}>AI Triage Summary <span className="ml-2 text-[10px] font-medium opacity-70 underline">Read-Only</span></h3>
                  <p className={`text-sm font-bold ${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'text-red-900' : 'text-amber-900'}`}>
                    Severity Index: Level {patient.clinical_data.ai_assessment.severity_level} 
                    ({patient.clinical_data.ai_assessment.severity_level >= 5 ? 'Critical Emergency' : 
                      patient.clinical_data.ai_assessment.severity_level >= 3 ? 'Moderate Clinical Risk' : 'Low Clinical Risk'})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold mr-2 ${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'text-red-700' : 'text-amber-700'}`}>Differential:</span>
                {patient.clinical_data.ai_assessment.differential_diagnosis.map(tag => (
                  <span key={tag} className={`px-2.5 py-1 bg-white border text-[10px] font-bold rounded ${patient.clinical_data.ai_assessment.severity_level >= 4 ? 'border-red-200 text-red-700' : 'border-amber-200 text-amber-700'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* PART 2: THE 11-SECTION DOCTOR FORM */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* 1. Patient Complaint */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <MessageSquare className="w-4 h-4 text-blue-600" /> 1. Patient Complaint
                </h4>
                <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded p-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Describe patient's chief complaints..."
                  defaultValue={patient.clinical_data.patient_complaint}
                />
              </div>

              {/* 2. History of Present Illness */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-blue-600" /> 2. History of Present Illness
                </h4>
                <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded p-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Clinical evolution of symptoms..."
                  defaultValue={patient.clinical_data.history_of_present_illness}
                />
              </div>

              {/* 3. Past History */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <History className="w-4 h-4 text-blue-600" /> 3. Past History
                </h4>
                <div className="space-y-2.5">
                  {['Hypertension', 'Diabetes Type 2', 'Chronic Migraine'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                        defaultChecked={patient.clinical_data.past_history.includes(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Other Illnesses</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-500" defaultValue="Appendectomy (2018)" />
                </div>
              </div>

              {/* 4. Vaccination Taken */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 4. Vaccination Taken
                </h4>
                <div className="border border-slate-100 rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-slate-500">Vaccine</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-500">Dose/Date</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { v: 'COVID-19 (Covishield)', d: '3rd Dose / 12-05-2022', s: 'Complete' },
                        { v: 'Influenza (Annual)', d: 'Scheduled Oct 2024', s: 'Due Soon' }
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="py-3 px-4 font-medium">{row.v}</td>
                          <td className="py-3 px-4 text-slate-500">{row.d}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.s === 'Complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{row.s}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Generals */}
              <div className="col-span-12 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Activity className="w-4 h-4 text-blue-600" /> 5. Generals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { l: 'Appearance', v: 'Conscious, Oriented, No Pallor' },
                    { l: 'Appetite', v: 'Poor (Reduced)' },
                    { l: 'Sleep Cycle', v: 'Disturbed due to acidity' },
                    { l: 'Bowel Movement', v: 'Regular, No constipation' },
                    { l: 'Urine', v: 'Normal frequency' },
                    { l: 'Perspiration', v: 'Normal' },
                    { l: 'Bad Habits', v: 'No Smoking, Occasional Alcohol' },
                    { l: 'Specific Note', v: 'Patient appears anxious' }
                  ].map((item) => (
                    <div key={item.l} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</label>
                      <input type="text" className="w-full border-b border-slate-200 py-1 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors" defaultValue={item.v} />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Allergies */}
              <div className="col-span-12 lg:col-span-12 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> 6. Allergies
                </h4>
                <div className="flex flex-wrap gap-8">
                  <div className="flex gap-4">
                    {['Peanuts', 'Penicillin', 'Latex'].map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500" />
                        {item}
                      </label>
                    ))}
                  </div>
                  <div className="flex-1 min-w-[300px]">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-500" placeholder="Describe specific reactions or other allergies..." defaultValue="Mild skin rash reported with Ibuprofen in the past." />
                  </div>
                </div>
              </div>

              {/* 7. Investigations Done */}
              <div className="col-span-12 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <Microscope className="w-4 h-4 text-blue-600" /> 7. Investigations Done
                  </h4>
                  <div className="flex text-[10px] font-bold uppercase tracking-widest overflow-hidden border border-slate-200 rounded">
                    <button className="px-4 py-1.5 bg-white text-blue-600 border-r border-slate-200">Tests</button>
                    <button className="px-4 py-1.5 text-slate-400 hover:bg-slate-50">Reports</button>
                  </div>
                </div>
                <div className="p-6">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 text-left">
                      <tr>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Test Name</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Result Summary</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {[
                        { t: 'CBC with Diff', d: '22-10-2024', r: 'Hb 12.8, WBC 8400 (Normal)' },
                        { t: 'Liver Function Test', d: '22-10-2024', r: 'Mild elevation in ALT (45 U/L)' }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">{row.t}</td>
                          <td className="py-3 px-4 text-slate-500">{row.d}</td>
                          <td className="py-3 px-4 text-slate-600 italic">{row.r}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-blue-600 font-bold hover:underline">View File</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8. Differential Diagnosis */}
              <div className="col-span-12 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <ClipboardList className="w-4 h-4 text-blue-600" /> 8. Differential Diagnosis
                  </h4>
                  <button onClick={addDifferential} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100">
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>
                <div className="border border-slate-100 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Diagnosis</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Probable Reason</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Investigations Suggested</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {differentials.map((row) => (
                        <tr key={row.id}>
                          <td className="py-3 px-4">
                            <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-800" defaultValue={row.diagnosis} />
                          </td>
                          <td className="py-3 px-4">
                            <input type="text" className="w-full bg-transparent outline-none text-slate-500" defaultValue={row.reason} />
                          </td>
                          <td className="py-3 px-4">
                            <input type="text" className="w-full bg-transparent outline-none text-blue-600 font-medium italic" defaultValue={row.investigation} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 9. Final Diagnosis */}
              <div className="col-span-12 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> 9. Final Diagnosis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Standardized ICD-10 Code</label>
                    <MedicalAutocomplete 
                      type="icd10" 
                      onSelect={(val) => console.log('ICD-10:', val)}
                      placeholder="Search ICD-10 Diagnosis..."
                    />
                  </div>
                  <div className="md:col-span-8 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Clinical assessment note</label>
                    <textarea 
                      className="w-full h-20 bg-slate-50 border border-slate-200 rounded p-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Final clinical summary..."
                      defaultValue="Acute Non-Atrophic Gastritis (K29.7). Prescribing PPI and diet modification."
                    />
                  </div>
                </div>
              </div>

              {/* 10. Prescriptions */}
              <div className="col-span-12 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                    <Pill className="w-4 h-4 text-blue-600" /> 10. Prescriptions
                  </h4>
                  <button onClick={addMedicine} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700">
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>
                <div className="border border-slate-100 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider min-w-[250px]">Medicine</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Dose</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Frequency</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Duration</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider">Instructions</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map((med) => (
                        <tr key={med.id} className="group hover:bg-slate-50/30">
                          <td className="py-2 px-4">
                            <MedicalAutocomplete 
                              type="rxnorm" 
                              onSelect={(val) => console.log('Medicine:', val)}
                              defaultValue={med.name}
                              className="text-xs"
                            />
                          </td>
                          <td className="py-2 px-4 font-bold">
                            <input type="text" className="w-full bg-transparent outline-none" defaultValue={med.dose} />
                          </td>
                          <td className="py-2 px-4">
                            <input type="text" className="w-full bg-transparent outline-none" defaultValue={med.frequency} />
                          </td>
                          <td className="py-2 px-4">
                            <input type="text" className="w-full bg-transparent outline-none font-bold" defaultValue={med.duration} />
                          </td>
                          <td className="py-2 px-4 text-slate-500 italic">
                            <input type="text" className="w-full bg-transparent outline-none" defaultValue={med.instructions} />
                          </td>
                          <td className="py-2 px-4 text-right">
                            <button onClick={() => removeMedicine(med.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Notes for Pharmacist</label>
                  <textarea 
                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded p-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="Special instructions (e.g. Do not substitute)..."
                    defaultValue="Avoid alcohol consumption while on Omeprazole. Take 30 mins before first meal."
                  />
                </div>
              </div>

              {/* 11. Follow Ups */}
              <div className="col-span-12 bg-white rounded border border-slate-200 shadow-sm p-6 space-y-6">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <CalendarDays className="w-4 h-4 text-blue-600" /> 11. Follow Ups
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Follow-up Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer" defaultValue="2024-11-01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Approx. Time</label>
                    <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer" defaultValue="10:30" />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Consultation Type</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 text-sm font-bold outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                      <option>Physical Visit (OPD)</option>
                      <option>Online Video Consultation</option>
                      <option>IPD Review</option>
                    </select>
                    <ChevronDown className="absolute right-4 bottom-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Special Follow-up Instructions</label>
                    <textarea 
                      className="w-full h-24 bg-slate-50 border border-slate-200 rounded p-4 text-sm font-medium focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Advise patient on what to monitor..."
                      defaultValue="Return immediately if abdominal pain Radiates to back or if persistent high-grade fever occurs. Bring food diary on next visit."
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer w-fit">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" defaultChecked />
                      Send automated reminder to patient via WhatsApp and Email
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PART 4: BOTTOM ACTION BAR (Flat) */}
        {patient && (
          <footer className="fixed bottom-0 right-0 left-64 bg-white/90 backdrop-blur border-t border-slate-200 p-6 z-40">
            <div className="max-w-6xl mx-auto flex items-center justify-end gap-4">
              <button className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
                Save as Draft
              </button>
              <button className="px-6 py-2.5 border border-slate-200 text-slate-500 rounded text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
                Clear All
              </button>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <button className="px-10 py-3 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10">
                Save & Complete Visit
              </button>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}
