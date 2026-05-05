import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-5 p-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <AlertTriangle size={28} className="text-amber-400" />
      </div>
      <div>
        <p className="text-amber-400 font-semibold mb-1">Something went wrong</p>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button id="retry-btn" onClick={onRetry} className="btn-primary">
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}
