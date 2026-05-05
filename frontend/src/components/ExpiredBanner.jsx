import React from 'react';
import { RefreshCw, RotateCcw, Clock, AlertTriangle, Zap } from 'lucide-react';
import { formatTime } from '../lib/session';

export default function ExpiredBanner({ onRestore, onGenerate, generating, lastAddress }) {
  const domain   = lastAddress ? lastAddress.split('@')[1] : null;
  const username = lastAddress ? lastAddress.split('@')[0] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[440px] gap-7 p-8 text-center animate-scale-in">
      {/* Animated expired icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background:'rgba(239,68,68,0.08)', border:'2px solid rgba(239,68,68,0.2)' }}>
          <Clock size={36} className="text-red-400" />
        </div>
        <div className="absolute inset-0 rounded-3xl animate-ping opacity-20"
          style={{ border:'2px solid rgba(239,68,68,0.5)' }} />
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
          style={{ background:'rgba(239,68,68,0.9)', boxShadow:'0 0 10px rgba(239,68,68,0.5)' }}>
          ✕
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-red-400">Session Expired</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
          Your 10-minute disposable session has ended and the inbox is no longer active.
        </p>

        {lastAddress && (
          <div className="mt-3 px-4 py-2.5 rounded-xl inline-flex flex-col items-center gap-1"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">Previous address</span>
            <span className="font-mono text-sm">
              <span className="text-slate-400">{username}</span>
              <span className="text-slate-600">@</span>
              <span className="text-slate-500">{domain}</span>
            </span>
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {[
          { icon:'⚡', label:'Instant setup' },
          { icon:'🔒', label:'100% private' },
          { icon:'♻️', label:'Renewable' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs text-slate-500"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-base">{icon}</span>
            <span className="leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {lastAddress && (
          <button
            id="restore-session-btn"
            onClick={onRestore}
            disabled={generating}
            className="flex-1 btn-ghost justify-center"
            style={{ borderColor:'rgba(59,130,246,0.3)', color:'#93c5fd' }}
          >
            <RotateCcw size={14} className={generating ? 'animate-spin' : ''} />
            Restore (+10 min)
          </button>
        )}
        <button
          id="generate-fresh-btn"
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary flex-1 justify-center"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating…' : 'New Email'}
        </button>
      </div>
    </div>
  );
}
