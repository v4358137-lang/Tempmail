import React, { useEffect, useState } from 'react';
import { Bell, X, Mail, Clock, AlertTriangle } from 'lucide-react';

let queue     = [];
let listeners = [];

export function triggerToast(msg, type = 'info') {
  const id   = Date.now() + Math.random();
  const item = { id, msg, type, ts: Date.now() };
  queue = [...queue, item];
  listeners.forEach(fn => fn([...queue]));
  setTimeout(() => {
    queue = queue.filter(t => t.id !== id);
    listeners.forEach(fn => fn([...queue]));
  }, 4500);
}

const ICON = {
  info:    { Icon: Bell,          color: 'text-sky-400',   bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.25)'  },
  mail:    { Icon: Mail,          color: 'text-emerald-400', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
  expire:  { Icon: Clock,         color: 'text-red-400',   bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'   },
};

function Toast({ toast, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const { Icon, color, bg, border } = ICON[toast.type] || ICON.info;

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        backdropFilter: 'blur(20px)',
        minWidth: 260, maxWidth: 340,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${border}`,
      }}
    >
      {/* Icon with ring */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}
          style={{ background: border }}>
          <Icon size={13} />
        </div>
        <span className="ring-notif absolute inset-0 rounded-full" />
      </div>

      {/* Message */}
      <p className="text-sm text-slate-200 flex-1 leading-snug pt-0.5">{toast.msg}</p>

      {/* Dismiss */}
      <button onClick={dismiss} className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(l => l !== setToasts); };
  }, []);

  const dismiss = (id) => {
    queue = queue.filter(t => t.id !== id);
    setToasts([...queue]);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto animate-slide-in-right">
          <Toast toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
