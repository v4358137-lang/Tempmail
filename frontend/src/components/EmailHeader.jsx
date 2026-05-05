import React, { useState, useEffect } from 'react';
import {
  Copy, Check, RefreshCw, Zap, Mail, Volume2, VolumeX,
  Shield, Clock, Wifi, WifiOff, Info,
} from 'lucide-react';
import { formatTime } from '../lib/session';

const TEN_MIN = 10 * 60 * 1000;

function StatCard({ icon: Icon, label, value, color = 'text-slate-400', glow }) {
  return (
    <div className={`stat-card flex-1 min-w-0 ${glow ? 'animate-glow-pulse' : ''}`}>
      <Icon size={14} className={color} />
      <span className="text-[11px] text-slate-500 leading-none">{label}</span>
      <span className={`text-sm font-bold leading-none ${color}`}>{value}</span>
    </div>
  );
}

function TimerRing({ timeRemaining, expired }) {
  const total = TEN_MIN;
  const pct   = expired ? 0 : Math.max(0, timeRemaining / total);
  const r     = 28;
  const circ  = 2 * Math.PI * r;
  const dash  = circ * pct;
  const isLow = timeRemaining < 60_000;
  const isMid = timeRemaining < 180_000;
  const color = expired ? '#ef4444' : isLow ? '#f87171' : isMid ? '#fbbf24' : '#38bdf8';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: 'stroke-dasharray 1s linear' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={`font-mono text-xs font-bold leading-none ${
          expired ? 'text-red-400' : isLow ? 'text-red-400 animate-pulse' : isMid ? 'text-amber-400' : 'text-sky-400'
        }`}>
          {expired ? 'EXP' : formatTime(timeRemaining)}
        </span>
        <span className="text-[9px] text-slate-600 leading-none mt-0.5">left</span>
      </div>
    </div>
  );
}

export default function EmailHeader({
  address, timeRemaining, generating, expired,
  unreadCount, totalReceived, pollStatus, sessionCreatedAt,
  soundEnabled, onToggleSound,
  onGenerate, onExtend,
  domains = [], selectedDomain, onSelectDomain,
  pollInterval = 2500, onSetPollInterval,
}) {
  const [copied, setCopied]     = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [uptime, setUptime]     = useState('0:00');

  // Live uptime counter
  useEffect(() => {
    if (!sessionCreatedAt) return;
    const iv = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionCreatedAt) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      setUptime(`${m}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, [sessionCreatedAt]);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (_) {
      const el = document.createElement('textarea');
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const domain = address ? address.split('@')[1] : null;
  const username = address ? address.split('@')[0] : null;
  const isLow = timeRemaining < 60_000;
  const isMid = timeRemaining < 180_000;

  return (
    <div className="glass-card p-5 animate-fade-in space-y-4">
      {/* ── Top row: branding + timer ring ─────────────────────── */}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #0891b2)',
              boxShadow: '0 0 24px rgba(59,130,246,0.4)',
            }}>
            <Mail size={22} className="text-white" />
          </div>
          {unreadCount > 0 && (
            <span className="badge-count absolute -top-1.5 -right-1.5 ring-notif">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black gradient-animated leading-none mb-0.5">TempMailX</h1>
          <p className="text-xs text-slate-500">Anonymous · Secure · Self-destructing</p>
          {/* Status row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="info-pill text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
            {pollStatus === 'polling' && (
              <span className="info-pill text-sky-400 gap-2">
                <div className="live-dot" />
                Receiving...
              </span>
            )}
            {pollStatus === 'error' && (
              <span className="info-pill text-red-400">
                <WifiOff size={10} />
                Poll error
              </span>
            )}
            <div className="relative">
              <span 
                onClick={() => setSpeedOpen(!speedOpen)}
                className="info-pill text-slate-400 cursor-pointer hover:text-slate-200">
                <Clock size={10} /> Speed: {pollInterval === 2000 ? 'Fast' : pollInterval === 10000 ? 'Eco' : 'Normal'}
              </span>
              
              {speedOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSpeedOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 flex flex-col rounded-lg overflow-hidden shadow-xl z-50 min-w-[120px] animate-fade-in"
                    style={{ background:'rgba(15,23,42,0.95)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                    {[
                      { label:'⚡ Fast (2s)', val: 2000 },
                      { label:'⚖️ Balanced (5s)', val: 5000 },
                      { label:'🐢 Eco (10s)', val: 10000 }
                    ].map(o => (
                      <button key={o.val} onClick={() => { onSetPollInterval?.(o.val); setSpeedOpen(false); }}
                        className={`px-3 py-2 text-xs text-left hover:bg-white/10 transition-colors ${pollInterval === o.val ? 'text-sky-400 font-bold bg-white/5' : 'text-slate-300'}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timer ring */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <TimerRing timeRemaining={timeRemaining} expired={expired} />
          {!expired && (
            <span className="text-[9px] text-slate-600 text-center leading-none">
              {isLow ? '⚠ expiring!' : isMid ? 'running low' : 'remaining'}
            </span>
          )}
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div className="flex gap-2">
        <StatCard icon={Mail}  label="Received"  value={totalReceived}      color="text-sky-400"     glow={totalReceived > 0} />
        <StatCard icon={Clock} label="Uptime"    value={uptime}             color="text-violet-400"  />
        <StatCard icon={Shield}label="Protected" value="100%"               color="text-emerald-400" />
        <StatCard icon={Wifi}  label="Polling"   value={pollStatus === 'polling' ? 'ON' : 'OFF'}
          color={pollStatus === 'polling' ? 'text-sky-400' : 'text-slate-600'} />
      </div>

      {/* ── Email address ──────────────────────────────────────── */}
      <div>
        {/* Domain Selection Badge */}
        {generating ? null : (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Your address</span>
            {domains.length > 0 && (
              <select
                value={selectedDomain || (domain ? `@${domain}` : '')}
                onChange={(e) => onSelectDomain?.(e.target.value)}
                className="text-[10px] px-2 py-0.5 rounded-full font-mono outline-none cursor-pointer hover:bg-sky-500/20 transition-colors"
                style={{ background:'rgba(56,189,248,0.1)', border:'1px solid rgba(56,189,248,0.2)', color:'#38bdf8' }}
              >
                {domains.map(d => (
                  <option key={d.id} value={`@${d.domain}`} className="bg-slate-900 text-sky-400">@{d.domain}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 p-3 rounded-xl group"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
          {generating ? (
            <div className="flex-1 flex items-center gap-2">
              <span className="flex gap-1">
                {[0,150,300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                    style={{ animationDelay:`${d}ms` }} />
                ))}
              </span>
              <span className="text-sm text-slate-500 font-mono">Generating address…</span>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <span className="font-mono text-sm text-slate-100 truncate block select-all">
                <span className="text-sky-300">{username}</span>
                <span className="text-slate-500">@</span>
                <span className="text-slate-300">{domain}</span>
              </span>
            </div>
          )}

          {/* Copy btn */}
          <div className="relative">
            <button
              id="copy-email-btn"
              onClick={copy}
              disabled={!address || generating}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                copied ? 'text-emerald-300 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-white hover:scale-105'
              }`}
              style={copied
                ? { background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)' }
                : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }
              }
              title="Copy email address"
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 text-white text-[10px] rounded animate-slide-up shadow-lg pointer-events-none">
                Copied!
              </span>
            )}
          </div>
        </div>

        {/* Helper tip */}
        {!generating && address && (
          <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
            <Info size={9} />
            Share this address anywhere — emails arrive here in real time
          </p>
        )}
      </div>

      {/* ── Action buttons ─────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <button
          id="generate-new-btn"
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary flex-1 min-w-[160px] justify-center"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating…' : 'New Email'}
        </button>

        {!expired && (
          <button id="extend-time-btn" onClick={onExtend} className="btn-ghost" title="Add 10 more minutes">
            <Zap size={14} className="text-amber-400" />
            +10 min
          </button>
        )}

        <button
          id="toggle-sound-btn"
          onClick={onToggleSound}
          className="btn-ghost px-3"
          title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
        >
          {soundEnabled
            ? <Volume2 size={14} className="text-sky-400" />
            : <VolumeX size={14} className="text-slate-600" />}
        </button>
      </div>

      {/* ── Warning banner ─────────────────────────────────────── */}
      {timeRemaining < 120_000 && !expired && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl animate-scale-in"
          style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)' }}>
          <span className="text-red-400 text-xs animate-pulse">⚠</span>
          <p className="text-xs text-red-300">
            Session expiring in {formatTime(timeRemaining)} — click <strong>+10 min</strong> to extend
          </p>
        </div>
      )}
    </div>
  );
}
