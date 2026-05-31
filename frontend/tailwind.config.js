/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "Manrope", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f3faf9",
          100: "#d9f2ed",
          200: "#b4e5db",
          300: "#87d2c4",
          400: "#51b7a7",
          500: "#2d9789",
          600: "#21796f",
          700: "#1f615a",
          800: "#1d4d49",
          900: "#193f3c",
        },
        ink: "#0f172a",
        shell: "#f6f8fb",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(18, 52, 86, 0.12)",
        soft: "0 14px 45px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(45,151,137,0.18), transparent 28%), radial-gradient(circle at top right, rgba(56,189,248,0.14), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(236,244,255,0.92))",
        "hero-radial-dark":
          "radial-gradient(circle at top left, rgba(45,151,137,0.24), transparent 30%), radial-gradient(circle at top right, rgba(56,189,248,0.22), transparent 28%), linear-gradient(145deg, rgba(10,15,27,0.95), rgba(15,23,42,0.94))",
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        pulseSlow: "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
    },
  },
  plugins: [],
};
