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
        surface: "#F7F8FA",
        "surface-elevated": "#FAFBFD",
        "surface-muted": "#EFF3F7",
        primary: "#005CA8",
        "primary-dark": "#003D7A",
        "primary-light": "#EAF5FF",
        foreground: "#001F4D",
        "text-secondary": "#64748B",
        "text-tertiary": "#94A3B8",
        border: "#E2E8F0",
        "border-strong": "#CBD5E1",
        accent: "#D97706",
        "accent-light": "#FEF3C7",
        success: "#16A765",
        "success-light": "#E7F8EF",
        warning: "#FFAD33",
        "warning-light": "#FFF3DE",
        error: "#D93025",
        "error-light": "#FDEAEA",
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
        card: "0 2px 8px rgb(0 31 77 / 0.08)",
        modal: "0 18px 48px rgb(0 31 77 / 0.18)",
        lift: "0 10px 28px rgb(0 92 168 / 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
