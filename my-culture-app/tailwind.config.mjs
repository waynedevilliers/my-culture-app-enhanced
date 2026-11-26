import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui, typography],
  daisyui: {
    themes: [
      {
        myCulture: {
          primary: '#FF6A00',
          secondary: '#6F7571',
          accent: '#DADADA',
          neutral: '#080808',
          'base-100': '#E3E7DB',
          info: '#6F7571',
          success: '#6BBF59',
          warning: '#E4B100',
          error: '#D9534F',
        },
      },
    ],
  },
};

export default config;
