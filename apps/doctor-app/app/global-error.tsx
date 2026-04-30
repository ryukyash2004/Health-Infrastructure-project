'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-200 max-w-xl space-y-8">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto rotate-3">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Critical System Failure</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              A critical exception occurred that the system could not recover from. Aegis Health Infrastructure has been halted to protect data integrity.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diagnostic Code</p>
            <code className="text-xs text-red-600 font-mono break-all">{error.digest || 'ERR_GLOBAL_HALT'}</code>
          </div>

          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
          >
            <RefreshCcw className="w-5 h-5" /> Reload Clinical Environment
          </button>
        </div>
      </body>
    </html>
  );
}
