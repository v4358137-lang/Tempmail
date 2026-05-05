import React, { useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft, Mail, Clock, Download, Loader2,
  AlertCircle, ExternalLink, Paperclip, User, LayoutTemplate, Code
} from 'lucide-react';

/* ─── Skeleton ─────────────────────────────────────────── */
function SkeletonViewer() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="flex gap-3 items-center">
        <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-36 rounded" />
          <div className="skeleton h-2.5 w-52 rounded" />
        </div>
      </div>
      <div className="skeleton h-px rounded" style={{ background:'rgba(255,255,255,0.06)' }} />
      <div className="space-y-2.5">
        {[100, 92, 87, 100, 78, 95, 65, 88, 100, 72].map((w, i) => (
          <div key={i} className="skeleton h-3 rounded" style={{ width:`${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────── */
function formatFullDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday:'long', year:'numeric', month:'long',
    day:'numeric', hour:'2-digit', minute:'2-digit',
  });
}
function getFromDisplay(from) {
  if (!from) return 'Unknown';
  if (typeof from === 'string') return from;
  if (from.name && from.address) return `${from.name} <${from.address}>`;
  return from.address || from.name || 'Unknown';
}
function getInitial(from) {
  return getFromDisplay(from).charAt(0).toUpperCase();
}
function hashColor(str) {
  const colors = [
    ['#3b82f6','#1d4ed8'],['#8b5cf6','#6d28d9'],['#ec4899','#be185d'],
    ['#10b981','#065f46'],['#f59e0b','#b45309'],['#06b6d4','#0e7490'],
  ];
  let h = 0;
  for (const c of (str||'?')) h = (h*31 + c.charCodeAt(0)) & 0xfffffff;
  return colors[h % colors.length];
}

function sanitizeHtml(html, mode) {
  if (mode === 'raw') {
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }
  // Clean mode: keep layout exactly the same, but remove malicious tags
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed']
  });
}

/* ─── Empty state ──────────────────────────────────────── */
function EmptyViewer() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center animate-fade-in">
      <div className="relative animate-float">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background:'rgba(14,165,233,0.07)', border:'1px solid rgba(14,165,233,0.12)' }}>
          <Mail size={34} className="text-sky-800" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-slate-500 text-sm"
          style={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(255,255,255,0.08)' }}>
          ✦
        </div>
      </div>
      <div>
        <p className="text-slate-400 font-semibold text-sm mb-2">No email selected</p>
        <p className="text-slate-600 text-xs leading-relaxed max-w-[200px]">
          Pick a message from the inbox to read it here
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
        {[
          { label:'Spam-free', icon:'🛡️' },
          { label:'Auto-delete', icon:'🔥' },
          { label:'Instant delivery', icon:'⚡' },
          { label:'100% private', icon:'🔒' },
        ].map(({ label, icon }) => (
          <div key={label} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs text-slate-500"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────── */
export default function EmailViewer({ message, content, loading, onClose }) {
  const iframeRef = useRef(null);
  const [viewMode, setViewMode] = useState('clean'); // 'clean' or 'raw'

  if (!message) return (
    <div className="glass-card h-full flex flex-col overflow-hidden animate-slide-in-right">
      <EmptyViewer />
    </div>
  );

  const bodyHtml = content?.html?.[0] || '';
  const bodyText = content?.text || content?.intro || message.intro || '';
  const hasHtml  = bodyHtml && bodyHtml.trim().length > 10;
  const [c1, c2] = hashColor(getFromDisplay(message.from));

  const attachments = content?.attachments || [];

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden animate-slide-in-right">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <button id="back-to-inbox-btn" onClick={onClose}
          className="btn-ghost px-2 py-1.5 md:hidden text-xs">
          <ArrowLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Mail size={12} className="text-sky-400" />
          Email Details
        </span>
        <div className="ml-auto flex items-center gap-2">
          {attachments.length > 0 && (
            <span className="info-pill text-amber-400">
              <Paperclip size={10} />
              {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {loading ? <SkeletonViewer /> : content?.error ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={26} className="text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-semibold mb-1">Failed to load email</p>
            <p className="text-slate-500 text-sm">{content.error}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* ── Meta header ──────────────────────────────── */}
          <div className="px-5 pt-5 pb-4 space-y-4 border-b"
            style={{ borderColor:'rgba(255,255,255,0.06)' }}>
            {/* Subject */}
            <h1 className="text-base font-bold text-white leading-tight">
              {message.subject || <span className="text-slate-500 italic">(no subject)</span>}
            </h1>

            {/* From / To */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                style={{ background:`linear-gradient(135deg, ${c1}, ${c2})`, boxShadow:`0 0 12px ${c1}55` }}>
                {getInitial(message.from)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {message.from?.name || 'Unknown'}
                  </span>
                  {message.from?.address && (
                    <span className="text-xs text-slate-500 font-mono truncate">
                      &lt;{message.from.address}&gt;
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Clock size={10} />
                  {formatFullDate(message.createdAt)}
                </div>
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-1.5">
              <span className="info-pill text-emerald-400">
                <span>✓</span> Delivered
              </span>
              {message.seen && (
                <span className="info-pill text-slate-500">
                  <span>👁</span> Read
                </span>
              )}
              {hasHtml && (
                <span className="info-pill text-sky-400">
                  <span>🌐</span> HTML
                </span>
              )}
              {attachments.length > 0 && (
                <span className="info-pill text-amber-400">
                  <Paperclip size={9} />
                  {attachments.length} file{attachments.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* ── Attachments ───────────────────────────────── */}
          {attachments.length > 0 && (
            <div className="px-5 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <Paperclip size={11} /> Attachments ({attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <Paperclip size={11} className="text-amber-400" />
                    <span className="text-slate-300 truncate max-w-[140px]">{att.filename || `file-${i+1}`}</span>
                    {att.size && <span className="text-slate-600">{(att.size/1024).toFixed(1)}KB</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Body Header ──────────────────────────────── */}
          {hasHtml && (
            <div className="px-5 py-2 flex items-center gap-2 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
              <button onClick={() => setViewMode('clean')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'clean' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                <LayoutTemplate size={12} /> Clean View
              </button>
              <button onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'raw' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                <Code size={12} /> Raw HTML
              </button>
            </div>
          )}

          {/* ── Body ─────────────────────────────────────── */}
          <div className="px-5 py-5 bg-slate-950/50">
            {hasHtml ? (
              <div className="max-w-4xl mx-auto">
                <div
                  className={`email-prose ${viewMode === 'clean' ? 'email-prose-clean' : 'email-prose-raw'}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml, viewMode) }}
                />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans max-w-4xl mx-auto">
                {bodyText || <span className="text-slate-600 italic">(empty email body)</span>}
              </pre>
            )}
          </div>

          {/* ── Footer ───────────────────────────────────── */}
          <div className="px-5 py-3 border-t text-[10px] text-slate-700 flex items-center gap-2"
            style={{ borderColor:'rgba(255,255,255,0.05)' }}>
            <span>End of message</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Received {formatFullDate(message.createdAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
