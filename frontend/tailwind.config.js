/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
<<<<<<< HEAD
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
=======
  content: ["./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
>>>>>>> feat/settings-page
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF0000",
<<<<<<< HEAD
        "primary-foreground": "#FFFFFF",
=======
>>>>>>> feat/settings-page
        secondary: "#2DB9E3",
        accent: "#FF2854",
        background: "#F9F5F5",
        card: "#FFFFFF",
        destructive: "#FF382B",
        foreground: "#050303",
        border: "#F3E8E8",
<<<<<<< HEAD
        muted: "#F3E8E8",
        "muted-foreground": "#6B6B6B"
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px"
      }
    }
  },
  plugins: []
};
=======
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
}
>>>>>>> feat/settings-page
