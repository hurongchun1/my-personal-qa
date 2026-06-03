/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自定义数字员工配色方案
        'digital-primary': '#0f172a',    // bg-slate-900
        'digital-secondary': 'rgba(30, 41, 59, 0.4)', // bg-slate-800/40
        'digital-accent': '#818cf8',     // text-indigo-400
        'digital-accent-dark': '#4f46e5', // bg-indigo-600
        'digital-surface': 'rgba(15, 23, 42, 0.8)', // bg-slate-900/80
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}