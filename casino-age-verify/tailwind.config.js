/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'casino': {
          gold: '#FFD700',
          'gold-dark': '#B8860B',
          red: '#DC143C',
          'red-dark': '#8B0000',
          green: '#228B22',
          'green-dark': '#006400',
          black: '#0A0A0A',
          purple: '#4B0082',
          'purple-dark': '#2E0054',
          blue: '#1E3A8A',
          'blue-dark': '#1E1B4B',
        },
        'neon': {
          gold: '#FFD700',
          red: '#FF073A',
          green: '#39FF14',
          blue: '#00BFFF',
          purple: '#BF40BF',
        }
      },
      animation: {
        'roulette-spin': 'roulette-spin 4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'roulette-slow': 'roulette-slow-spin 2s linear infinite',
        'ball-spin': 'ball-spin 4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'jackpot-flash': 'jackpot-flash 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s infinite',
      },
      keyframes: {
        'roulette-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(3600deg)' }
        },
        'roulette-slow-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(720deg)' }
        },
        'ball-spin': {
          'from': { transform: 'rotate(0deg) translateX(180px) rotate(0deg)' },
          'to': { transform: 'rotate(-3600deg) translateX(180px) rotate(3600deg)' }
        },
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700',
            boxShadow: '0 0 5px #FFD700, 0 0 10px #FFD700, 0 0 15px #FFD700'
          },
          '50%': { 
            textShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700',
            boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700'
          }
        },
        'jackpot-flash': {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0.7' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      backgroundImage: {
        'casino-main': 'linear-gradient(135deg, #0f0f23 0%, #1a0033 50%, #0a0a0a 100%)',
        'casino-card': 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(75,0,130,0.2) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        'silver-gradient': 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 50%, #6B7280 100%)',
        'bronze-gradient': 'linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #A0522D 100%)',
        'red-gradient': 'linear-gradient(135deg, #DC143C 0%, #B91C1C 50%, #8B0000 100%)',
        'green-gradient': 'linear-gradient(135deg, #228B22 0%, #32CD32 50%, #00FF00 100%)',
        'purple-gradient': 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 50%, #9400D3 100%)',
        'velvet': 'radial-gradient(ellipse at center, rgba(75, 0, 130, 0.8) 0%, rgba(25, 25, 112, 0.9) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
        'neon-red': '0 0 20px rgba(220, 20, 60, 0.5), 0 0 40px rgba(220, 20, 60, 0.3)',
        'neon-green': '0 0 20px rgba(34, 139, 34, 0.5), 0 0 40px rgba(34, 139, 34, 0.3)',
        'casino-card': '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(255, 215, 0, 0.1)',
        'roulette': '0 0 50px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}