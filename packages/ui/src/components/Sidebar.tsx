"use client";

import React from 'react';
import { 
  Stethoscope, 
  LogOut,
  LucideIcon,
  Menu,
  X
} from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

interface SidebarProps {
  navItems: NavItem[];
  onLogout: () => void;
  onLogoClick?: () => void;
  activeItem?: string;
  footerItems?: NavItem[];
  isExpanded?: boolean;
  isMobileOpen?: boolean;
  onToggleExpand?: () => void;
  onMobileClose?: () => void;
}

export function Sidebar({
  navItems,
  onLogout,
  onLogoClick,
  activeItem,
  footerItems = [],
  isExpanded = false,
  isMobileOpen = false,
  onToggleExpand,
  onMobileClose,
}: SidebarProps) {
  const showLabels = isExpanded || isMobileOpen;

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-800 bg-slate-900 text-slate-300 shadow-2xl transition-all duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } w-[17rem] ${isExpanded ? 'md:w-[17rem]' : 'md:w-20'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-5">
          <button 
            type="button"
            className={`flex min-w-0 items-center gap-3 rounded-lg transition-colors ${showLabels ? 'flex-1' : 'justify-center'}`}
            onClick={onLogoClick}
            title="Aegis Health"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clinical-blue">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            {showLabels && (
              <span className="truncate text-left text-lg font-bold tracking-tight text-white uppercase">
                Aegis Health
              </span>
            )}
          </button>

          {(onToggleExpand || onMobileClose) && (
            <button
              type="button"
              aria-label={isMobileOpen ? 'Close menu' : 'Toggle sidebar'}
              onClick={isMobileOpen ? onMobileClose : onToggleExpand}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4 md:hidden" />
              <Menu className="hidden h-4 w-4 md:block" />
            </button>
          )}
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <button 
              key={item.label}
              onClick={item.onClick}
              title={item.label}
              className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                showLabels ? 'gap-3 justify-start' : 'justify-center'
              } ${item.active || activeItem === item.label ? 'bg-clinical-blue text-white shadow-lg shadow-blue-950/30' : 'hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {showLabels && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-800 p-4">
          {footerItems.map((item) => (
            <button 
              key={item.label}
              onClick={item.onClick}
              title={item.label}
              className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                showLabels ? 'gap-3 justify-start' : 'justify-center'
              } ${item.className || 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {showLabels && <span className="truncate">{item.label}</span>}
            </button>
          ))}
          <button 
            onClick={onLogout}
            title="Logout"
            className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 ${
              showLabels ? 'gap-3 justify-start' : 'justify-center'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
