/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'halva': ['Halva', 'sans-serif'],
    },
  },
  plugins: [
    require('daisyui'),
  ],
}
