/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'halva': ['Halva', 'sans-serif'],
      'mono': defaultTheme.fontFamily.mono,
    },
  },
  plugins: [
    require('daisyui'),
  ],
}
