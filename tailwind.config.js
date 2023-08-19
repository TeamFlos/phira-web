/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      halva: ["Halva", "sans-serif"],
      mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
      ubuntu: ["Ubuntu", "sans-serif"],
      tektur: ["Tektur"],
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
