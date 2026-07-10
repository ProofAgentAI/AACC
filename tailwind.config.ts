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
          300: "#4ECB8B",
          400: "#00C767",
          500: "#009A4D",
          600: "#007A3D",
          700: "#005E2F",
        },
        red: {
          DEFAULT: "#D71920",
          50: "#FCEAEB",
          300: "#F5757B",
          400: "#F04349",
          500: "#E02830",
          600: "#D71920",
          700: "#B0131A",
        },
        gold: {
          DEFAULT: "#C9A227",
          100: "#F5EDD3",
          300: "#E8C866",
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
        "glow-green": "0 0 24px rgba(0, 199, 103, 0.35), 0 8px 24px rgba(11, 31, 58, 0.12)",
        "glow-red": "0 0 24px rgba(240, 67, 73, 0.30), 0 8px 24px rgba(11, 31, 58, 0.12)",
        "glow-gold": "0 0 24px rgba(217, 188, 85, 0.35), 0 8px 24px rgba(11, 31, 58, 0.12)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-18px) scale(1.04)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "0.9" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        "float-slow": "float 13s ease-in-out infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
