"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Pill, 
  Microscope, 
  FileBarChart, 
  MessageSquare, 
  Settings, 
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Search,
  Activity
} from 'lucide-react';
import { signout } from './login/actions';
import { useBackendStatus } from '@/components/BackendStatus';
import { Sidebar, Header, NavItem } from '@aegis/ui';

interface QueueItem {
  id: number;
  patient_name: string;
  severity: number;
  visit_date: string;
  status: string;
  is_red_flag: boolean;
  created_at: string;
}

export default function DoctorDashboard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { setUnreachable } = useBackendStatus();

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/patients/queue');
      if (!response.ok) throw new Error('Failed to fetch triage queue');
      const data = await response.json();
      setQueue(data);
      setUnreachable(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      if (err instanceof Error && err.message === 'Failed to fetch') {
        setUnreachable(true);
      }
    } finally {
      setLoading(false);
    }
  }, [setUnreachable]);

  useEffect(() => {
    fetchQueue();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const stats = {
    critical: queue.filter(p => p.severity === 5).length,
    serious: queue.filter(p => p.severity === 3 || p.severity === 4).length,
    routine: queue.filter(p => p.severity <= 2).length,
  };

  const filteredQueue = queue.filter(p => 
    p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  const getSeverityStyles = (level: number) => {
    if (level >= 5) return "bg-red-50 text-red-700 border-red-100";
    if (level >= 3) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const getStatusBadge = (status: string) => {
    if (status === "Completed") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
          <CheckCircle2 className="w-3 h-3" /> Validated
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Users, label: 'Patients' },
    { icon: Calendar, label: 'Appointments' },
    { icon: Pill, label: 'Prescriptions' },
    { icon: Microscope, label: 'Investigations' },
    { icon: FileBarChart, label: 'Reports' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      
      {/* Left Sidebar */}
      <Sidebar 
        navItems={navItems} 
        onLogout={signout} 
        onLogoClick={() => router.push('/')}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-w-0">
        
        {/* Header */}
        <Header 
          title="Triage Command Center"
          subtitle="Hospital ID: Aegis-Main-01"
          user={{
            name: "Dr. Sarah Connor",
            role: "MBBS, MD",
            initials: "SC"
          }}
          onRefresh={fetchQueue}
          isLoading={loading}
        />

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Severity Counters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border-l-4 border-l-red-500 rounded-xl shadow-sm p-6 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Critical (Level 5)</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.critical}</h3>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-500 w-6 h-6" />
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-l-amber-500 rounded-xl shadow-sm p-6 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Serious (Level 3-4)</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.serious}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Activity className="text-amber-500 w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border-l-4 border-l-emerald-500 rounded-xl shadow-sm p-6 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Routine (Level 1-2)</p>
                <h3 className="text-3xl font-black text-slate-900">{stats.routine}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-emerald-500 w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Queue Table Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Live Triage Queue</h2>
                <p className="text-xs text-slate-500 font-medium">Prioritized by clinical severity index</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="py-4 px-6">Patient Name & ID</th>
                    <th className="py-4 px-6">Severity Index</th>
                    <th className="py-4 px-6">Time Submitted</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.length > 0 ? (
                    filteredQueue.map((patient) => (
                      <tr 
                        key={patient.id}
                        onClick={() => router.push(`/patient/${patient.id}`)}
                        className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-200">
                              {patient.patient_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.patient_name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Case #AE-{patient.id.toString().padStart(5, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`w-fit px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getSeverityStyles(patient.severity)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            Level {patient.severity}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-xs font-medium text-slate-600">{patient.visit_date}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Wait time: ~12m</p>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(patient.status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Record</span>
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Users className="text-slate-200 w-8 h-8" />
                          </div>
                          <p className="text-slate-400 font-medium italic">No cases found in the triage queue.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredQueue.length} records in queue</p>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 cursor-not-allowed">Previous</button>
                <button disabled className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
