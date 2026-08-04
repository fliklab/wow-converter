/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6D5DFC",
        "primary-hover": "#5948F3",
        card: "#FFFFFF",
        border: "#E6E8F2",
        "text-primary": "#172033",
        "text-secondary": "#697386",
      },
      boxShadow: {
        sm: "0 2px 6px rgba(0, 0, 0, 0.1)",
        md: "0 4px 12px rgba(0, 0, 0, 0.15)",
        lg: "0 6px 16px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
