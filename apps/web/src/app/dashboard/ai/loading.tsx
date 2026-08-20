import { Loader2 } from 'lucide-react';

export default function AILoading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-zinc-950 text-white space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30">
        स
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
        <span>Loading Saarthi AI Workspace...</span>
      </div>
    </div>
  );
}
