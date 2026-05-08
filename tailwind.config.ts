import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F7F9FC",
        primary: "#1A6FD4",
        "primary-light": "#E8F0FE",
        foreground: "#1A1A2E",
        "text-secondary": "#6B7280",
        border: "#E2E8F0",
        accent: "#FF6B35",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
        modal: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
