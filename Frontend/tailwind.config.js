/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edfcf4',
          100: '#d2f9e3',
          200: '#a9f1cc',
          300: '#6ee3ad',
          400: '#32ce87',
          500: '#0db368',
          600: '#059154',
          700: '#067345',
          800: '#085b38',
          900: '#084b2f',
          950: '#032a1b',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
