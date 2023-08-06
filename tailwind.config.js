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
      'ubuntu': ['Ubuntu'],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('daisyui'),
  ],
}
