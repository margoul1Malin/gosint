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
        background: '#0a0a0a',
        foreground: '#00ff88',
        primary: '#00ff88',
        secondary: '#ff0080',
        accent: '#00d4ff',
        warning: '#ffaa00',
        error: '#ff3366',
        surface: '#1a1a1a',
        'surface-light': '#2a2a2a',
        border: '#333333',
      },
      fontFamily: {
        sans: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Orbitron', 'ui-monospace', 'monospace'],
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite alternate',
        pulse: 'pulse 2s ease-in-out infinite',
        slideIn: 'slideIn 0.5s ease-out',
        fadeIn: 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor' 
          },
          '50%': { 
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' 
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideIn: {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 136, 0.5)',
        'glow-sm': '0 0 10px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 30px rgba(0, 255, 136, 0.6)',
      },
    },
  },
  plugins: [],
} 