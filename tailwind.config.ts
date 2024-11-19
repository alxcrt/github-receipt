/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["VT323", "monospce"],
        costum: ["CostumFont", "sans-serif"],
      },
      animation: {
        receipt: "receipt 1s forwards",
        "receipt-printing": "receipt-printing 10s forwards",
        "receipt-led": "receipt-led 10s forwards",
        label: "label 10s forwards",
      },
      keyframes: {
        // show after 10s
        label: {
          "0%": {
            opacity: "0",
          },
          "80%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        receipt: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        "receipt-printing": {
          "0%": {
            transform: "translateY(-55%) scale(0.82)",
          },
          "100%": {
            transform: "translateY(40%) scale(0.9)",
          },
        },
        "receipt-led": {
          "0%": {
            opacity: "0",
          },
          "25%": {
            opacity: "0.75",
          },
          "50%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0.1",
          },
        },
      },
    },
  },
  plugins: [],
};
