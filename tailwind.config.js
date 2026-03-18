/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        'tablet': '800px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF003C',
          50:  '#fff0f3',
          100: '#ffe0e7',
          200: '#ffc2cf',
          300: '#ff8099',
          400: '#ff4d6b',
          500: '#FF1F4B',
          600: '#FF003C',
          700: '#cc0030',
          800: '#990024',
          900: '#4d0012',
          950: '#2a000a',
        },
        accent: {
          DEFAULT: '#00f3ff',
          300: '#80f9ff',
          400: '#00f3ff',
          500: '#00d4e0',
          600: '#00a8b5',
          700: '#007a85',
          800: '#004f57',
          900: '#002a2e',
        },
      },
    },
  },
  plugins: [],
}
