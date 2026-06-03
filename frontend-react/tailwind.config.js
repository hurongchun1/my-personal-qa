/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nebula-base': '#020617',
        'nebula-purple': '#4c1d95',
        'nebula-cyan': '#0891b2',
        'nebula-indigo': '#3730a3',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
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
        'island': '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.08), 0 0 60px rgba(99, 102, 241, 0.04)',
        'island-hover': '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.15), 0 0 80px rgba(99, 102, 241, 0.06)',
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.15)',
        'glow-violet': '0 0 24px rgba(139, 92, 246, 0.15)',
        'glow-cyan': '0 0 24px rgba(8, 145, 178, 0.12)',
      },
      borderRadius: {
        'island': '24px',
      },
    },
  },
  plugins: [],
}
