import React, { useEffect, useRef } from 'react';
import { Inbox, Clock, Loader2, MailOpen, Sparkles } from 'lucide-react';

function SkeletonRow({ delay = 0 }) {
  return (
    <div className="px-3 py-3 rounded-xl animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-2.5 rounded" style={{ width:`${55 + (delay % 3) * 15}%` }} />
          <div className="skeleton h-2 rounded w-20" />
        </div>
        <div className="skeleton h-2 w-12 rounded" />
      </div>
      <div className="skeleton h-2.5 rounded ml-10" style={{ width:`${65 + (delay % 2) * 20}%` }} />
    </div>
  );
}

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 10_000)      return 'Just now';
  if (diff < 60_000)      return `${Math.floor(diff / 1000)} sec ago`;
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function getFromDisplay(from) {
  if (!from) return 'Unknown';
  if (typeof from === 'string') return from;
  return from.name || from.address || 'Unknown';
}

function getInitial(from) {
  const s = getFromDisplay(from);
  return s.charAt(0).toUpperCase();
}

function hashColor(str) {
  const colors = [
    ['#3b82f6','#1d4ed8'], ['#8b5cf6','#6d28d9'], ['#ec4899','#be185d'],
    ['#10b981','#065f46'], ['#f59e0b','#b45309'], ['#06b6d4','#0e7490'],
    ['#ef4444','#b91c1c'], ['#a855f7','#7c3aed'],
  ];
  let h = 0;
  for (const c of (str || '?')) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return colors[h % colors.length];
}

export default function InboxList({
  messages, loading, generating, selectedMsg, newMailIds, onSelect,
}) {
  const listRef = useRef(null);

  // Auto-scroll to top when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [messages]);

  if (loading || generating) {
    return (
      <div className="glass-card h-full flex flex-col overflow-hidden animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
          <Inbox size={15} className="text-sky-400" />
          <span className="text-sm font-semibold text-slate-300">Inbox</span>
          <Loader2 size={12} className="text-slate-600 animate-spin ml-auto" />
        </div>
        <div className="p-2 space-y-0.5">
          {[0, 80, 160, 240].map(d => <SkeletonRow key={d} delay={d} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden animate-slide-in-left">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <Inbox size={15} className="text-sky-400" />
        <span className="text-sm font-semibold text-slate-300">Inbox</span>
        {messages.length > 0 && (
          <span className="text-[10px] text-slate-500 ml-auto mr-1">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
        )}
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 ml-auto bg-white/5 px-2 py-1 rounded-full border border-white/5" title="Polling for new mail">
          <div className="live-dot" />
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">Receiving...</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5" ref={listRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-5 text-center px-4 animate-fade-in">
            <div className="relative animate-float">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.15)' }}>
                <MailOpen size={28} className="text-sky-700" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-semibold text-sm mb-1">Inbox is empty</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                Send an email to your address and<br />it will appear here instantly
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0,200,400].map(d => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-sky-500/40 animate-bounce"
                  style={{ animationDelay:`${d}ms` }} />
              ))}
            </div>
            <p className="text-[10px] text-slate-700 flex items-center gap-1">
              <Sparkles size={9} />
              Auto-updating
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isSelected = selectedMsg?.id === msg.id;
            const isNew      = newMailIds.has(msg.id);
            const isUnread   = !msg.seen || isNew;
            const [c1, c2]   = hashColor(getFromDisplay(msg.from));

            return (
              <button
                key={msg.id}
                id={`email-row-${msg.id}`}
                onClick={() => onSelect(msg)}
                className={`email-row animate-fade-in ${isSelected ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                style={{
                  animationDelay: `${Math.min(i * 50, 300)}ms`,
                  boxShadow: isNew && !isSelected ? '0 0 12px rgba(56,189,248,0.15)' : 'none',
                }}
              >
                <div className="flex items-center gap-2.5">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${c1}, ${c2})`,
                      boxShadow: isNew ? `0 0 10px ${c1}66` : 'none',
                    }}>
                    {getInitial(msg.from)}
                  </div>

                  {/* Sender + time */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs truncate flex-1 ${isUnread ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
                        {getFromDisplay(msg.from)}
                      </span>
                      <span className="text-[10px] text-slate-600 flex-shrink-0 flex items-center gap-0.5">
                        <Clock size={8} />
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* New dot */}
                  {isNew && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0"
                      style={{ boxShadow:'0 0 6px #38bdf8' }} />
                  )}
                </div>

                {/* Subject */}
                <p className={`text-xs truncate pl-[42px] ${isUnread ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                  {msg.subject || '(no subject)'}
                </p>

                {/* Preview */}
                {msg.intro && (
                  <div className="pl-[42px]">
                    <p className="text-[11px] text-slate-600 email-preview-text">
                      {msg.intro}
                    </p>
                  </div>
                )}

                {/* NEW badge */}
                {isNew && (
                  <div className="pl-[42px]">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background:'rgba(56,189,248,0.15)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.3)' }}>
                      NEW
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t text-[10px] text-slate-700 flex items-center gap-1"
          style={{ borderColor:'rgba(255,255,255,0.05)' }}>
          <div className="live-dot w-1 h-1" />
          Auto-refreshing · {messages.length} total
        </div>
      )}
    </div>
  );
}
