"use client";

import React from 'react';
import { 
  Stethoscope, 
  LogOut,
  LucideIcon
} from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  navItems: NavItem[];
  onLogout: () => void;
  onLogoClick?: () => void;
  activeItem?: string;
}

export function Sidebar({ navItems, onLogout, onLogoClick, activeItem }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-50">
      <div 
        className="p-6 flex items-center gap-3 border-b border-slate-800 cursor-pointer" 
        onClick={onLogoClick}
      >
        <div className="w-8 h-8 bg-clinical-blue rounded flex items-center justify-center">
          <Stethoscope className="text-white w-5 h-5" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight uppercase">Aegis Health</span>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button 
            key={item.label}
            onClick={item.onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${item.active || activeItem === item.label ? 'bg-clinical-blue text-white' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
