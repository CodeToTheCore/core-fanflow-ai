/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B00',
          'orange-light': '#FF8C38',
          'orange-glow': '#FF6B0033',
          purple: '#7B2FBE',
          'purple-light': '#9B4FDE',
          'purple-glow': '#7B2FBE33',
          black: '#0A0A0F',
          'black-light': '#12121A',
          'black-card': '#1A1A26',
          'black-border': '#2A2A3A',
          white: '#F0F0FF',
          muted: '#6B6B8A',
        },
        // Alias used by the components folded in from the v2 build.
        'card-bg': '#1A1A26',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'orange-purple': 'linear-gradient(135deg, #FF6B00, #7B2FBE)',
        'card-gradient': 'linear-gradient(145deg, #1A1A26, #12121A)',
      },
      boxShadow: {
        'orange-glow': '0 0 30px rgba(255, 107, 0, 0.3)',
        'purple-glow': '0 0 30px rgba(123, 47, 190, 0.3)',
        'card': '0 4px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
      },
      keyframes: {
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,0,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,107,0,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(255,107,0,0.3)' },
          '50%': { borderColor: 'rgba(123,47,190,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
 