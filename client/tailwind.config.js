/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // 👈 Add this

  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        brand: {
          brown: "#8B6914",
          "brown-dark": "#6B5010",
          cream: "#F5F0E8",
          sand: "#EDE9E1",
          dark: "#1A1A1A",
          teal: "#1B5E6E",
          gold: "#C4A55A",
        },
      },

      boxShadow: {
        soft: "0 12px 34px rgba(40,30,20,.14)",
        product: "0 10px 30px rgba(40,30,20,.08)",
      },

      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },

  plugins: [],
};