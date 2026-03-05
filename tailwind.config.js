/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './event/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
      ubuntu: ['Ubuntu', 'sans-serif'],
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
    require('@tailwindcss/typography'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
    require('daisyui'),
  ],
};
