/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edfcf4',
          100: '#d2f9e3',
          200: '#a9f1cc',
          300: '#6ee3ad',
          400: '#32ce87',
          500: '#0db368',
          600: '#00854B',
          700: '#006D3D',
          800: '#085b38',
          900: '#074430',
          950: '#021a10',
        },
      },
      fontFamily: {
        display: ['"Public Sans"', 'sans-serif'],
        body: ['"Public Sans"', 'sans-serif'],
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.04), 0 16px 40px rgba(5,145,84,0.10)',
        'brand': '0 2px 16px rgba(5,145,84,0.28)',
        'brand-lg': '0 4px 32px rgba(5,145,84,0.36)',
      },
    },
  },
  plugins: [],
}
