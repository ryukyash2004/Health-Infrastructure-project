"use client";

import ChatArea from "../components/ChatArea";
import InputBar from "../components/InputBar";
import Modals from "../components/Modals";
import IntakeForm from "../components/IntakeForm";
import { useStore } from "../store/useStore";
import { Sidebar, Header as SharedHeader, NavItem } from '@aegis/ui';
import { 
  LayoutDashboard, 
  MessageSquare, 
  History, 
  Settings, 
  FileText
} from 'lucide-react';

export default function Home() {
  const { isIntakeComplete } = useStore();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: MessageSquare, label: 'AI Triage' },
    { icon: History, label: 'My Cases' },
    { icon: FileText, label: 'Records' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <main className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {!isIntakeComplete ? (
        <IntakeForm />
      ) : (
        <>
          <Sidebar 
            navItems={navItems} 
            onLogout={() => window.location.reload()} 
            onLogoClick={() => window.location.reload()}
          />
          
          <div className="flex-1 ml-64 flex flex-col min-w-0 h-screen relative">
            <SharedHeader 
              title="Patient Portal"
              subtitle="AI-Powered Clinical Triage"
              user={{
                name: "Guest Patient",
                role: "Self-Triage Mode",
                initials: "GP"
              }}
            />
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatArea />
              <InputBar />
            </div>

            <Modals />
          </div>
        </>
      )}
    </main>
  );
}
