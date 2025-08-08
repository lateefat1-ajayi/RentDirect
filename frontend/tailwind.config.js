import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        text: "#1E1E1E",
        primary: "#128C7E",
        accent: "#FFD600",
        success: "#2ECC71",
        danger: "#E74C3C",
      },
      fontFamily: {
        heading: ["Poppins", ...fontFamily.sans],
        body: ["Inter", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
