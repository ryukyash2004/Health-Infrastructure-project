"use client";

import React from 'react';
import { 
  Bell,
  RefreshCw,
  ArrowLeft,
  Phone,
  Menu
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
  emergencyCallHref?: string;
  emergencyCallLabel?: string;
  onMenuClick?: () => void;
}

export function Header({
  title,
  subtitle,
  user,
  onRefresh,
  onBack,
  isLoading,
  emergencyCallHref,
  emergencyCallLabel = 'Call 112',
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6 xl:px-8">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-800 md:text-lg">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {emergencyCallHref && (
          <a
            href={emergencyCallHref}
            className="hidden items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100 sm:flex"
          >
            <Phone className="w-3.5 h-3.5" />
            {emergencyCallLabel}
          </a>
        )}
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
        <div className="hidden h-6 w-px bg-slate-200 md:block"></div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
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
