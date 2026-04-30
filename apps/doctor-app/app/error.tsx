'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled UI Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center shadow-inner">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Something went wrong</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          The application encountered an unexpected clinical error. The event has been logged for the technical team.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
      >
        <RefreshCcw className="w-4 h-4" /> Reset Application State
      </button>
    </div>
  );
}
