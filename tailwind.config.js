/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
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
        invert: {
          css: {
            color: "#d1d5db",
            a: {
              color: "#3182ce",
              "&:hover": {
                color: "#60a5fa",
              },
            },
            h1: {
              color: "#fff",
            },
            h2: {
              color: "#fff",
            },
            h3: {
              color: "#fff",
            },
            h4: {
              color: "#fff",
            },
            h5: {
              color: "#fff",
            },
            h6: {
              color: "#fff",
            },
            strong: {
              color: "#fff",
            },
            code: {
              color: "#fff",
            },
            figcaption: {
              color: "#9ca3af",
            },
            blockquote: {
              color: "#d1d5db",
              borderLeftColor: "#4b5563",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
