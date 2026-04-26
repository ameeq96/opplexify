import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f4f7fb",
        neon: "#6ee7b7",
        signal: "#ff7a59",
        cobalt: "#2455d6"
      },
      boxShadow: {
        glow: "0 24px 90px rgba(36, 85, 214, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
