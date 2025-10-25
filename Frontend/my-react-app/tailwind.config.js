export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        airbnb: {
          red: "#FF385C",
          gray: "#717171",
          light: "#F7F7F7",
          dark: "#222222",
        },
      },
      boxShadow: {
        air: "0 2px 8px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
