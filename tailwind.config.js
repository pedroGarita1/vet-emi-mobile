/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f1fc',
          100: '#efeafb',
          200: '#ddd2f3',
          300: '#c6b4e6',
          500: '#8b78b9',
          700: '#5d4a82',
          900: '#2f273f',
        },
      },
    },
  },
  plugins: [],
};