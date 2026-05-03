"use client";

import { useState } from "react";
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
  FileText,
  Hospital
} from 'lucide-react';

export default function Home() {
  const { isIntakeComplete } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarOffset = isSidebarOpen ? 'md:ml-[17rem]' : 'md:ml-20';

  const openHospitalSearch = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFindHospitals = () => {
    if (!navigator.geolocation) {
      openHospitalSearch("https://www.google.com/maps/search/hospitals+near+me");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        openHospitalSearch(
          `https://www.google.com/maps/search/hospitals/@${coords.latitude},${coords.longitude},14z`
        );
      },
      () => {
        openHospitalSearch("https://www.google.com/maps/search/hospitals+near+me");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: MessageSquare, label: 'AI Triage' },
    { icon: History, label: 'My Cases' },
    { icon: FileText, label: 'Records' },
    { icon: Settings, label: 'Settings' },
  ];
  const footerItems: NavItem[] = [
    {
      icon: Hospital,
      label: 'Find Nearby Hospitals',
      onClick: handleFindHospitals,
      className: 'text-red-300 hover:bg-red-500/10 hover:text-red-100 animate-pulse'
    }
  ];

  return (
    <main className="flex min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {!isIntakeComplete ? (
        <IntakeForm />
      ) : (
        <>
          <Sidebar 
            navItems={navItems} 
            footerItems={footerItems}
            isExpanded={isSidebarOpen}
            isMobileOpen={isSidebarOpen}
            onToggleExpand={() => setIsSidebarOpen((prev) => !prev)}
            onMobileClose={() => setIsSidebarOpen(false)}
            onLogout={() => window.location.reload()} 
            onLogoClick={() => window.location.reload()}
          />
          
          <div className={`flex min-w-0 flex-1 flex-col relative h-screen transition-[margin] duration-300 ${sidebarOffset}`}>
            <SharedHeader 
              title="Patient Portal"
              subtitle="AI-Powered Clinical Triage"
              user={{
                name: "Guest Patient",
                role: "Self-Triage Mode",
                initials: "GP"
              }}
              emergencyCallHref="tel:112"
              emergencyCallLabel="Call 112"
              onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
            />
            
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
