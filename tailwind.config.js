/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#8b92e8',
          400: '#6470d8',
          500: '#4050c4',
          600: '#191970', // midnight blue
          700: '#13156a',
          800: '#0d0f50',
          900: '#07083a',
        },
        accent: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // human red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#450a0a',
        },
      },
    },
  },
  plugins: [],
}

