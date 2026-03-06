/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF0000",
        secondary: "#2DB9E3",
        accent: "#FF2854",
        background: "#F9F5F5",
        card: "#FFFFFF",
        destructive: "#FF382B",
        foreground: "#050303",
        border: "#F3E8E8",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
}