/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./event/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
      ubuntu: ["Ubuntu", "sans-serif"],
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
