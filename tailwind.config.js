/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f3f5fc',
          100: '#dee4f7',
          200: '#bcc7f1',
          300: '#7e95ed',
          400: '#2b55ee',
          500: '#0831c4',
          600: '#01239f', // brand color
          700: '#011c7f',
          800: '#01155f',
          900: '#020f3e',
          950: '#020924',
        },
      },
    },
  },
  plugins: [],
}