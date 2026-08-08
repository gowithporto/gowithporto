/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/providers/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)"],
        serif: ["var(--font-cormorant)"],
        accent: ["var(--font-righteous)"],
      },
      colors: {
        primary: "#1B3936",
        accent: "#57BAEA",
        background: "#F1EDE1",
        textMain: "#AABBCC",
      },
    },
  },
  plugins: [],
};
