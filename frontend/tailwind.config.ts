import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14171F",
          800: "#1B1F2A",
          700: "#232838",
          600: "#2E3448",
        },
        paper: "#F5F6F8",
        signal: {
          DEFAULT: "#5B5FEF",
          light: "#8A8DF5",
          dark: "#4245C4",
        },
        live: "#F5A623",
        correct: "#16A34A",
        wrong: "#E14B4B",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
