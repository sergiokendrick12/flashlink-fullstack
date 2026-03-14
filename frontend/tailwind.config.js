/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#1A3A6B', 50: '#E8EDF5', 100: '#C5D0E6', 500: '#1e4d8c', 900: '#0d1f3c' },
        gold:  { DEFAULT: '#F47B20', light: '#f9a05a', dark: '#c45e0a' },
        cream: '#FDF8EF',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body:    ['Open Sans', 'sans-serif'],
      },
      animation: {
        'fade-up':  'fadeUp 0.6s ease forwards',
        'fade-in':  'fadeIn 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}