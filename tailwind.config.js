/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040b16',
        panel: '#0a192f',
        border: '#1e2d4a',
        cyan: {
          400: '#00f2fe',
          500: '#4facfe',
        },
        electric: '#1a365d',
        brand: {
          organic: '#10b981', // green
          lightPlastic: '#3b82f6', // blue
          heavyPlastic: '#f59e0b', // orange
          unknown: '#ef4444', // red
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'conveyor': 'conveyor 5s linear infinite',
        'flash-red': 'flash-red 1s ease-in-out infinite',
      },
      keyframes: {
        conveyor: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-100px 0' },
        },
        'flash-red': {
          '0%, 100%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
