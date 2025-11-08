import scrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    scrollbar, // Enables `scrollbar-thin`, `scrollbar-thumb-*`, etc.
  ],
};
