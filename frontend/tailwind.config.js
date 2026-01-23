/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        duke: {
          900: "#012169",
          700: "#00539B",
          500: "#73A5C6",
        },
        slate: {
          950: "#0F172A",
          700: "#334155",
          500: "#64748B",
          200: "#E2E8F0",
          50: "#F8FAFC",
        },
      },
      fontFamily: {
        heading: ["Merriweather", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(1, 33, 105, 0.25)",
      },
    },
  },
  plugins: [],
};
