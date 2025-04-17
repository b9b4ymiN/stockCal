export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: { colors: { primary: "#4f46e5" } } },
  plugins: [require("@tailwindcss/forms")],
};
