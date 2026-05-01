"use client";

import React from 'react';
import { 
  Bell,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: {
    name: string;
    role: string;
    initials: string;
  };
  onRefresh?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function Header({ title, subtitle, user, onRefresh, onBack, isLoading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors group"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-clinical-blue' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        )}
        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-clinical-blue rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user.role}</p>
          </div>
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200">
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
