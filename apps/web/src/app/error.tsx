'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Saarthi App Error Boundary Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30 shadow-lg">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold font-display tracking-tight text-white mb-2">
        Something Went Wrong
      </h2>
      <p className="text-xs text-zinc-400 max-w-md mb-6">
        An unexpected error occurred while loading this section. Please try refreshing or return to the dashboard.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all border border-zinc-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
