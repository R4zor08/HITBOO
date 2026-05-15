
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0f172a',
          darker: '#0f1419',
          card: 'rgba(15, 23, 42, 0.6)',
        },
        neon: {
          cyan: '#06b6d4',
          magenta: '#ec4899',
          purple: '#8b5cf6',
          lime: '#22c55e',
          yellow: '#eab308',
        },
        rarity: {
          common: '#64748b',
          rare: '#10b981',
          epic: '#3b82f6',
          legendary: '#8b5cf6',
          mythic: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px theme("colors.neon.cyan"), 0 0 20px theme("colors.neon.cyan")',
        'neon-magenta': '0 0 5px theme("colors.neon.magenta"), 0 0 20px theme("colors.neon.magenta")',
        'neon-purple': '0 0 5px theme("colors.neon.purple"), 0 0 20px theme("colors.neon.purple")',
        'neon-lime': '0 0 5px theme("colors.neon.lime"), 0 0 20px theme("colors.neon.lime")',
        glass:
          '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #8b5cf655 0deg, #00f0ff55 180deg, #ff00e555 360deg)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 0.15s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: .8, filter: 'brightness(1.5)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 240, 255, 0.8)' },
        },
        'shimmer': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: 1 },
          '20%, 24%, 55%': { opacity: 0.8 },
        },
        'neon-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { textShadow: '0 0 10px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.5)' },
          '20%, 24%, 55%': { textShadow: 'none' },
        }
      }
    },
  },
  plugins: [],
}
