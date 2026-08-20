'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white font-sans antialiased min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
            स
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight text-white">
            Application Exception
          </h1>
          <p className="text-xs text-zinc-400">
            A temporary system error occurred. Click below to reload the workspace.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
