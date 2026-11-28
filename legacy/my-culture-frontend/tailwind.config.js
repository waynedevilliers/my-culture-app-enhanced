/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"),
  ],
  daisyui: {
    themes: [
      {
        myCulture: {
          "primary": "#FF6A00",
          "secondary": "#6F7571",
          "accent": "#DADADA",
          "neutral": "#080808",
          "base-100": "#E3E7DB",
          "info": "#6F7571",
          "success": "#6BBF59",
          "warning": "#E4B100",
          "error": "#D9534F"
        },
      },
    ],
  },
};
