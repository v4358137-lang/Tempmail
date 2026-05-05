import React, { useEffect, useRef, useState } from 'react';
import { useEmail } from '../hooks/useEmail';
import EmailHeader      from '../components/EmailHeader';
import InboxList        from '../components/InboxList';
import EmailViewer      from '../components/EmailViewer';
import ExpiredBanner    from '../components/ExpiredBanner';
import ErrorState       from '../components/ErrorState';
import { triggerToast } from '../components/Toast';
import {
  ExternalLink,
  HelpCircle, Mail,
} from 'lucide-react';

/* ─── Animated mesh background ──────────────────────────── */
function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Deep base */}
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Matrix Hacker Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_50%)] animate-pulse-slow" />
      <div className="w-full h-full bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] animate-matrix-pan" />
      
      {/* Subtle Blobs */}
      <div className="absolute rounded-full opacity-30"
        style={{
          width:600, height:600, top:-200, left:-150,
          background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          animation:'blobMove 18s ease-in-out infinite',
        }} />
      <div className="absolute rounded-full opacity-20"
        style={{
          width:500, height:500, top:'40%', right:-150,
          background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          animation:'blobMove 22s ease-in-out infinite reverse',
        }} />
    </div>
  );
}

/* ─── Feature chips (top ribbon) ────────────────────────── */
const FEATURES = [
  { icon:'⚡', text:'Instant setup' },
  { icon:'🛡️', text:'No signup' },
  { icon:'🔒', text:'100% anonymous' },
  { icon:'🔥', text:'Auto-delete' },
  { icon:'📬', text:'Live inbox' },
  { icon:'♾️', text:'Unlimited use' },
];

function FeatureRibbon() {
  return (
    <div className="flex items-center justify-center flex-wrap gap-2 py-3">
      {FEATURES.map(({ icon, text }) => (
        <span key={text}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-slate-400 font-medium"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          {icon} {text}
        </span>
      ))}
    </div>
  );
}

/* ─── How it works ──────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:'1', icon:'📋', title:'Get address', desc:'A unique email is generated instantly — no account needed.' },
    { n:'2', icon:'📤', title:'Share it',    desc:'Use this address on any website to receive emails.' },
    { n:'3', icon:'📬', title:'Read mail',   desc:'Emails arrive in real time. Click to read full content.' },
    { n:'4', icon:'🔥', title:'Auto-expire', desc:'After 10 minutes, the address is destroyed automatically.' },
  ];
  return (
    <div className="glass-card p-5 animate-fade-in mt-4">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle size={15} className="text-sky-400" />
        <span className="text-sm font-semibold text-slate-300">How it works</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map(({ n, icon, title, desc }) => (
          <div key={n} className="flex flex-col gap-2 p-3 rounded-xl"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                style={{ background:'linear-gradient(135deg,#2563eb,#0891b2)' }}>{n}</span>
              <span className="text-base">{icon}</span>
            </div>
            <p className="text-xs font-semibold text-slate-300">{title}</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Loading screen ────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6" style={{ minHeight:'60vh' }}>
      <div className="relative animate-float">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background:'linear-gradient(135deg, #1d4ed8, #0891b2)',
            boxShadow:'0 0 40px rgba(37,99,235,0.5)',
          }}>
          <Mail size={34} className="text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl animate-ping opacity-30"
          style={{ border:'2px solid rgba(56,189,248,0.6)' }} />
      </div>
      <div className="text-center space-y-2">
        <p className="gradient-animated font-black text-xl">TempMailX</p>
        <p className="text-slate-500 text-sm">Generating your secure inbox…</p>
      </div>
      <div className="flex gap-1.5">
        {[0,150,300].map(d => (
          <span key={d} className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
            style={{ animationDelay:`${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function Home() {
  const {
    session, messages, selectedMsg, msgContent,
    loading, generating, msgLoading, error,
    timeRemaining, expired, unreadCount, newMailIds,
    soundEnabled, setSoundEnabled,
    totalReceived, pollStatus, sessionCreatedAt,
    generateNew, restoreExpired, extendActive, openMessage, setSelectedMsg,
    sessionsList, switchSession, removeSession,
    domains, pollInterval, setPollInterval
  } = useEmail();

  const [selectedDomain, setSelectedDomain] = useState('');
  const prevCount   = useRef(0);
  const prevExpired = useRef(false);
  const [showViewer, setShowViewer] = useState(false);

  // ── Toast triggers ────────────────────────────────────────
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      const diff = unreadCount - prevCount.current;
      triggerToast(`📬 ${diff} new email${diff > 1 ? 's' : ''} arrived!`, 'mail');
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (expired && !prevExpired.current) {
      triggerToast('⏰ Session expired. Restore or generate a new address.', 'expire');
    }
    prevExpired.current = expired;
  }, [expired, timeRemaining]);

  const handleSelect = (msg) => { openMessage(msg); setShowViewer(true); };
  const handleBack   = () => { setShowViewer(false); setSelectedMsg(null); };

  const isReady = session || error;

  return (
    <div className="relative min-h-screen flex flex-col" style={{ zIndex:1 }}>
      <MeshBackground />

      {/* ── Topbar ─────────────────────────────────────────── */}
      <header className="relative z-10 sticky top-0"
        style={{ background:'rgba(3,7,18,0.7)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#2563eb,#0891b2)', boxShadow:'0 0 14px rgba(37,99,235,0.4)' }}>
              <Mail size={16} className="text-white" />
            </div>
            <span className="font-black text-sm gradient-animated">TempMailX</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session && !expired && !loading && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">{session.address}</span>
              </div>
            )}
            <span className="text-xs text-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              mail.tm
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 pb-8">

        {!isReady && loading ? (
          <LoadingScreen />
        ) : error ? (
          <div className="max-w-md mx-auto mt-6">
            <div className="glass-card">
              <ErrorState message={error} onRetry={() => generateNew(selectedDomain)} />
            </div>
          </div>
        ) : expired ? (
          <div className="max-w-lg mx-auto mt-4">
            <div className="glass-card">
              <ExpiredBanner
                onRestore={restoreExpired}
                onGenerate={() => generateNew(selectedDomain)}
                generating={generating}
                lastAddress={session?.address}
              />
            </div>
            <HowItWorks />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* ── Tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-2">
              {sessionsList.map(s => {
                const isActive = s.address === session?.address;
                return (
                  <div key={s?.address || Math.random()}
                    onClick={() => s?.address && switchSession(s.address)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl border-b-2 cursor-pointer transition-colors ${
                      isActive ? 'bg-white/10 border-sky-400 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-mono">{(s?.address || '').split('@')[0]}</span>
                    {sessionsList.length > 1 && (
                      <span onClick={(e) => { e.stopPropagation(); s?.address && removeSession(s.address); }}
                        className="text-[10px] hover:text-red-400 ml-1">✖</span>
                    )}
                  </div>
                );
              })}
              {sessionsList.length < 5 && (
                <button onClick={() => generateNew(selectedDomain)}
                  className="px-3 py-1.5 text-xs text-sky-400 font-bold bg-white/5 hover:bg-white/10 rounded-t-xl border-b-2 border-transparent transition-colors">
                  + New
                </button>
              )}
            </div>

            {/* Email header card */}
            <EmailHeader
              address={session?.address}
              timeRemaining={timeRemaining}
              generating={generating}
              expired={expired}
              unreadCount={unreadCount}
              totalReceived={totalReceived}
              pollStatus={pollStatus}
              sessionCreatedAt={sessionCreatedAt}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(v => !v)}
              onGenerate={() => generateNew(selectedDomain)}
              onExtend={extendActive}
              domains={domains}
              selectedDomain={selectedDomain}
              onSelectDomain={setSelectedDomain}
              pollInterval={pollInterval}
              onSetPollInterval={setPollInterval}
            />

            {/* Split inbox / viewer */}
            <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4" style={{ minHeight: 520 }}>
              <div className={showViewer ? 'hidden md:flex md:flex-col' : 'flex flex-col'}>
                <InboxList
                  messages={messages}
                  loading={loading}
                  generating={generating}
                  selectedMsg={selectedMsg}
                  newMailIds={newMailIds}
                  onSelect={handleSelect}
                />
              </div>
              <div className={showViewer ? 'flex flex-col' : 'hidden md:flex md:flex-col'}>
                <EmailViewer
                  message={selectedMsg}
                  content={msgContent}
                  loading={msgLoading}
                  onClose={handleBack}
                />
              </div>
            </div>

            {/* How it works */}
            <HowItWorks />
          </div>
        )}
      </main>

      {/* ── Ad Space Placeholder ───────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 mb-6">
        <div className="flex flex-col items-center justify-center py-6 rounded-xl border border-dashed text-slate-500 transition-colors hover:bg-white/5 hover:border-slate-600"
          style={{ borderColor:'rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.2)' }}>
          <span className="text-xs font-black tracking-widest uppercase opacity-50 mb-1">Advertisement</span>
          <span className="text-[10px] opacity-40">Google Ads Space</span>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t py-5 mt-auto"
        style={{ borderColor:'rgba(255,255,255,0.05)', background:'rgba(3,7,18,0.6)' }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Mail size={12} />
            <span>TempMailX — Free disposable email service</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <span>No cookies · No tracking · No BS</span>
            <a href="https://mail.tm" target="_blank" rel="noreferrer"
              className="flex items-center gap-1 hover:text-slate-400 transition-colors">
              <ExternalLink size={10} /> Powered by mail.tm
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
