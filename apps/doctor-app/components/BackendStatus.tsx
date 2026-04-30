'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCcw, AlertCircle } from 'lucide-react';

interface BackendStatusContextType {
  isUnreachable: boolean;
  checkStatus: () => Promise<void>;
  setUnreachable: (status: boolean) => void;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export function BackendStatusProvider({ children }: { children: React.ReactNode }) {
  const [isUnreachable, setIsUnreachable] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/patients/queue', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000) 
      });
      if (isUnreachable) setIsUnreachable(false);
    } catch (error) {
      setIsUnreachable(true);
    }
  }, [isUnreachable]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <BackendStatusContext.Provider value={{ isUnreachable, checkStatus, setUnreachable: setIsUnreachable }}>
      {isUnreachable && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-6 py-3 shadow-2xl animate-in slide-in-from-top duration-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                <WifiOff className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-none mb-0.5">Critical Connectivity Error</p>
                <p className="text-sm font-medium text-red-50">The Aegis Python backend is completely unreachable. Clinical data may be stale.</p>
              </div>
            </div>
            <button 
              onClick={() => checkStatus()}
              className="flex items-center gap-2 px-4 py-1.5 bg-white text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Reconnect
            </button>
          </div>
        </div>
      )}
      <div className={isUnreachable ? 'mt-12' : ''}>
        {children}
      </div>
    </BackendStatusContext.Provider>
  );
}

export function useBackendStatus() {
  const context = useContext(BackendStatusContext);
  if (context === undefined) {
    throw new Error('useBackendStatus must be used within a BackendStatusProvider');
  }
  return context;
}
