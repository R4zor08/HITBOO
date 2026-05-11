
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0e27',
          darker: '#050816',
          card: 'rgba(10, 14, 39, 0.6)',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff00e5',
          purple: '#8b5cf6',
          lime: '#84ff00',
          yellow: '#ffea00',
        },
        rarity: {
          common: '#9ca3af',
          rare: '#22c55e',
          epic: '#3b82f6',
          legendary: '#a855f7',
          mythic: '#eab308',
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
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #8b5cf655 0deg, #00f0ff55 180deg, #ff00e555 360deg)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: .8, filter: 'brightness(1.5)' },
        }
      }
    },
  },
  plugins: [],
}
