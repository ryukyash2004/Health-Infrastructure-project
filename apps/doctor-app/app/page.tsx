"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Stethoscope, 
  Search, 
  Users, 
  LayoutDashboard, 
  Calendar, 
  Pill, 
  Microscope, 
  FileBarChart, 
  MessageSquare, 
  Settings, 
  LogOut,
  Bell,
  ArrowRight
} from 'lucide-react';

export default function SearchPage() {
  const [searchId, setSearchId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      // Support both "AE-00001" and just "1"
      const numericId = searchId.replace(/AE-/i, '').replace(/^0+/, '');
      router.push(`/patient/${numericId}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar - Consistent with the rest of the app */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
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

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">Doctor Dashboard</h1>
          
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

        {/* Search Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-12 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200 rotate-3">
                <Stethoscope className="text-white w-10 h-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Case Search</h2>
              <p className="text-slate-500 text-lg font-medium">Access live triage assessments and medical records from the Aegis PostgreSQL engine.</p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex p-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Enter Patient Case ID (e.g. 1, AE-00015)..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                >
                  Load Patient <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-100">
              {[
                { label: 'Live Database', value: 'Connected', color: 'text-emerald-500' },
                { label: 'Active Triage', value: 'Ready', color: 'text-blue-500' },
                { label: 'Security', value: 'HIPAA Compliant', color: 'text-slate-400' }
              ].map((stat) => (
                <div key={stat.label} className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
