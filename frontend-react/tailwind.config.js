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
        'digital-surface': 'rgba(15, 23, 42, 0.6)', // bg-slate-900/60
        'digital-glass': 'rgba(15, 23, 42, 0.6)',
        'digital-border': 'rgba(255, 255, 255, 0.1)',
        'digital-glow-blue': 'rgba(59, 130, 246, 0.5)',
        'digital-glow-purple': 'rgba(139, 92, 246, 0.5)',
        'digital-glow-indigo': 'rgba(99, 102, 241, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
        'pulse-purple': 'pulse-purple 2s ease-in-out infinite',
        'rotate-glow': 'rotate-glow 10s linear infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.5)' },
        },
        'pulse-purple': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.5)' },
        },
        'rotate-glow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
        'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.5)',
        'glow-blue-lg': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glow-purple-lg': '0 0 30px rgba(139, 92, 246, 0.5)',
        'glow-indigo-lg': '0 0 30px rgba(99, 102, 241, 0.5)',
      },
    },
  },
  plugins: [],
}