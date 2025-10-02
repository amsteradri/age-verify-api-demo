/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'casino-red': '#DC2626',
        'casino-gold': '#F59E0B',
        'casino-green': '#059669',
        'casino-black': '#111827',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 20px #F59E0B' },
          'to': { boxShadow: '0 0 30px #F59E0B, 0 0 40px #F59E0B' },
        },
      },
      backgroundImage: {
        'casino-gradient': 'linear-gradient(135deg, #1F2937 0%, #111827 50%, #0F172A 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
        'red-gradient': 'linear-gradient(135deg, #FCA5A5 0%, #DC2626 50%, #B91C1C 100%)',
      }
    },
  },
  plugins: [],
}