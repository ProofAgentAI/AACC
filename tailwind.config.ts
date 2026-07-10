import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          50: "#EEF2F7",
          100: "#D8E0EB",
          200: "#AFC0D6",
          300: "#7E97B8",
          400: "#4E6E97",
          500: "#2C4C74",
          600: "#1B3557",
          700: "#132844",
          800: "#0B1F3A",
          900: "#071527",
        },
        green: {
          DEFAULT: "#007A3D",
          50: "#E6F5EE",
          100: "#C2E6D4",
          500: "#009A4D",
          600: "#007A3D",
          700: "#005E2F",
        },
        red: {
          DEFAULT: "#D71920",
          50: "#FCEAEB",
          600: "#D71920",
          700: "#B0131A",
        },
        gold: {
          DEFAULT: "#C9A227",
          100: "#F5EDD3",
          400: "#D9BC55",
          500: "#C9A227",
          600: "#A8861D",
        },
        surface: "#F7F8FA",
        ink: "#111827",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-manrope)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(11, 31, 58, 0.06), 0 8px 24px rgba(11, 31, 58, 0.08)",
        "card-hover": "0 2px 6px rgba(11, 31, 58, 0.08), 0 16px 40px rgba(11, 31, 58, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
