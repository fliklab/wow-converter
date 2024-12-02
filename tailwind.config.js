/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#1db954",
        "primary-hover": "#1ed760",
        card: "#1e1e1e",
        border: "#333333",
        "text-primary": "#ffffff",
        "text-secondary": "#aaaaaa",
      },
      boxShadow: {
        sm: "0 2px 6px rgba(0, 0, 0, 0.1)",
        md: "0 4px 12px rgba(0, 0, 0, 0.15)",
        lg: "0 6px 16px rgba(0, 0, 0, 0.2)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#333",
            a: {
              color: "#3182ce",
              "&:hover": {
                color: "#2c5282",
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
