'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="space-y-8 max-w-sm">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">SYSTEM ERROR</h1>
            <p className="text-slate-500 font-medium">
              The Aegis Patient App has encountered a critical error. To protect your session, we have paused the application.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-all shadow-xl active:scale-95"
          >
            <RefreshCcw className="w-5 h-5" /> Reload App
          </button>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Diagnostic: {error.digest || 'CRITICAL_CLIENT_HALT'}
          </p>
        </div>
      </body>
    </html>
  );
}
