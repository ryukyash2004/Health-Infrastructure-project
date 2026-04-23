"use client";

import { Menu, AlertCircle, FileText } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Header() {
  const { toggleLeftMenu, toggleMedicalForm, toggleSos } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 z-40 max-w-2xl mx-auto">
      <button 
        onClick={toggleLeftMenu}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

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
