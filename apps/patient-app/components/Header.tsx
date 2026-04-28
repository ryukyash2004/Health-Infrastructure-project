"use client";

import { Menu, AlertCircle, FileText, Hash } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Header() {
  const { toggleLeftMenu, toggleMedicalForm, toggleSos, caseId } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-40 max-w-4xl lg:max-w-5xl mx-auto transition-all">
      <button 
        onClick={toggleLeftMenu}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {caseId && (
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-100 animate-in fade-in zoom-in duration-300">
          <Hash className="w-4 h-4" />
          <span className="text-sm font-bold tracking-tight">Case ID: #{caseId}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSos}
          className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium text-sm hover:bg-red-100 transition-colors border border-red-100"
        >
          <AlertCircle className="w-4 h-4" />
          <span>SOS</span>
        </button>
        <button 
          onClick={toggleMedicalForm}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FileText className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}
