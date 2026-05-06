/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E88B7B',
          dark:    '#D96E5D',
          hover:   '#C85A48',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'sans-serif',
        ],
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out':    'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast':   '150ms',
        'normal': '250ms',
        'slow':   '400ms',
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out both',
        'slide-up':   'slideUp 0.35s cubic-bezier(0,0,0.2,1) both',
        'slide-right':'slideInRight 0.3s cubic-bezier(0,0,0.2,1) both',
        'bounce-in':  'bounceIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'spin-fast':  'spin 0.65s linear infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        bounceIn:     { '0%': { opacity: '0', transform: 'scale(0.85)' }, '60%': { transform: 'scale(1.04)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:      { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [],
};
