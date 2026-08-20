import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold text-xl flex items-center justify-center mb-4 border border-emerald-500/30">
        404
      </div>
      <h1 className="text-2xl font-bold font-display tracking-tight text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-xs text-zinc-400 max-w-sm mb-6">
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
