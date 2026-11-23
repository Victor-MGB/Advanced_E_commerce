export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172337",
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          400: "#fb9c3c",
          500: "#f68b1e",
          600: "#e57c0c",
          700: "#c96800",
          800: "#9d4f00",
        },
        gold: {
          100: "#fff8d6",
          400: "#fcd000",
          500: "#f5b800",
        },
        sale: {
          50: "#fff1f2",
          500: "#e11d48",
          700: "#be123c",
        },
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica Neue", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 14px -6px rgba(23, 35, 55, 0.18)",
        float: "0 12px 28px -12px rgba(23, 35, 55, 0.28)",
      },
    },
  },
  plugins: [],
};
