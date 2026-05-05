import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Lock, Mail, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      
      {/* ── Hacker/Matrix Animated Background ────────────────── */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_50%)] animate-pulse-slow" />
        <div className="w-full h-full bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] animate-matrix-pan" />
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl w-full px-6 py-20 text-center flex flex-col items-center">
        
        {/* App Logo */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] bg-emerald-500/20 border border-emerald-500/40"
        >
          <Mail size={32} className="text-emerald-400" />
        </motion.div>

        {/* Hero Headers */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight"
        >
          Disposable Email in <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse-fast">
            10 Minutes
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-300 font-semibold mb-6 max-w-2xl"
        >
          Beat Spam with Temporary Mail
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 text-sm text-slate-400 mb-10"
        >
          <span className="flex items-center gap-1.5"><Lock size={14} className="text-emerald-400"/> No data stored</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-400"/> Auto deleted</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-400"/> Privacy first</span>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/app')}
          className="relative group px-8 py-4 bg-emerald-500 text-slate-950 font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] transition-all overflow-hidden flex items-center gap-3"
        >
          <div className="absolute inset-0 w-1/4 h-full bg-white/30 skew-x-[45deg] group-hover:translate-x-[400%] transition-transform duration-700 ease-out" />
          Get Temporary Email <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Viral Badges */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-4 w-full max-w-3xl"
        >
          <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-2xl mb-2 block">🔥</span>
            <p className="text-emerald-400 font-bold text-lg leading-none">1000+</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Users Today</p>
          </div>
          <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-emerald-400 font-bold text-lg leading-none">&lt;2 sec</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Email Delivery</p>
          </div>
          <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-2xl mb-2 block">🚀</span>
            <p className="text-emerald-400 font-bold text-lg leading-none">Zero</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Signup Required</p>
          </div>
        </motion.div>
      </div>
      
      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="absolute bottom-4 text-xs text-slate-600 font-medium">
        Use this email on any site to receive emails instantly and stay completely anonymous.
      </footer>
    </div>
  );
}
