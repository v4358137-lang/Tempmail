const typography = require('@tailwindcss/typography');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        neon: {
          blue:   '#38bdf8',
          purple: '#a78bfa',
          green:  '#34d399',
          pink:   '#f472b6',
        },
        dark: {
          900: '#030712',
          800: '#060d1f',
          700: '#0a1129',
          600: '#0d1629',
          500: '#111f3a',
          400: '#172447',
        },
      },
      animation: {
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite',
        'float':        'float 4s ease-in-out infinite',
        'shimmer':      'shimmer 1.6s ease-in-out infinite',
        'fade-in':      'fadeIn 0.4s ease-out both',
        'slide-up':     'slideUp 0.35s ease-out both',
        'slide-in-right':'slideInRight 0.3s ease-out both',
        'slide-in-left':'slideInLeft 0.3s ease-out both',
        'scale-in':     'scaleIn 0.25s ease-out both',
        'spin-slow':    'spin 3s linear infinite',
        'ping-slow':    'ping 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 15px rgba(59,130,246,0.25)' },
          '50%':     { boxShadow: '0 0 35px rgba(59,130,246,0.55)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        blobMove: {
          '0%,100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%', transform: 'translate(0,0) scale(1)' },
          '25%':     { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%', transform: 'translate(5%,5%) scale(1.05)' },
          '50%':     { borderRadius: '50% 60% 30% 60%/30% 40% 70% 60%', transform: 'translate(-5%,3%) scale(0.98)' },
          '75%':     { borderRadius: '40% 30% 60% 70%/40% 70% 30% 50%', transform: 'translate(3%,-5%) scale(1.02)' },
        },
      },
    },
  },
  plugins: [typography],
};
