'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Patient App Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">Oops! Something went wrong</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          We encountered a technical issue while processing your request. Please try reloading the page.
        </p>
      </div>

      <div className="flex flex-col w-full max-w-xs gap-3">
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
        <Link 
          href="/"
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
