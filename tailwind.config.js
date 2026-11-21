/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#070A0E',
          900: '#0B0F14',
          800: '#121820',
          700: '#1A232E',
          600: '#263445',
        },
        slateGlass: 'rgba(26, 36, 48, 0.75)',
        jade: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        amberGold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        pebble: {
          light: '#CBD5E1',
          stone: '#8E9CAE',
          dark: '#475569',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-jade': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.35)',
        'inner-pit': 'inset 0 4px 12px 0 rgba(0, 0, 0, 0.65)',
        'elevated-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}