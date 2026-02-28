/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forensic-black': '#050505',
        'forensic-charcoal': '#111111',
        'forensic-surface': '#1A1A1A',
        'forensic-emerald': '#10B981',
        'forensic-emerald-dim': 'rgba(16, 185, 129, 0.15)',
        'forensic-violet': '#8B5CF6',
        'forensic-crimson': '#F43F5E',
        'forensic-crimson-dim': 'rgba(244, 63, 94, 0.15)',
        'forensic-cyan': '#06B6D4',
        'forensic-text': '#E2E8F0',
        'forensic-muted': '#94A3B8'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-fast': 'pulseFast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 2s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        pulseFast: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        glitch: {
          '2%, 64%': { transform: 'translate(2px, 0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px, 0) skew(0deg)' },
          '62%': { transform: 'translate(0, 0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}