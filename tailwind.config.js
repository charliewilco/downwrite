module.exports = {
  purge: [
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      mono: ["Jetbrains Mono", "monospace"],
      serif: ["Source Serif Pro", "Charter", "Georgia", "serif"]
    },
    extend: {
      screens: {
        "2xl": "1536px"
      },
      colors: {
        accent: {
          "200": "#6ca4ff",
          "400": "#0f76ff",
          "700": "#004ccb"
        },
        blk: {
          "800": "#1E1E1E",
          "900": "#121212"
        },
        onyx: {
          "100": "#e3e4e4",
          "200": "#c8c9ca",
          "300": "#aeafb1",
          "400": "#949698",
          "500": "#7b7d80",
          "600": "#636669",
          "700": "#4c4f52",
          "800": "#36393d",
          "900": "#212529"
        },
        pixieblue: {
          "100": "#d4ecfe",
          "200": "#a9d8fd",
          "300": "#7cc3fc",
          "400": "#4cadfb",
          "500": "#2597f1",
          "600": "#2082cf",
          "700": "#1c6dae",
          "800": "#185a8f",
          "900": "#144770"
        },
        goldar: {
          "100": "#fff3d4",
          "200": "#ffe7a8",
          "300": "#ffdb79",
          "400": "#ffcd46",
          "500": "#ffbe0f",
          "600": "#fdaf04",
          "700": "#fb9f0a",
          "800": "#f89011",
          "900": "#f57f17"
        }
      },
      maxWidth: {
        xxs: "16rem"
      },
      animation: {
        "from-left": "from-left 0.45s ease-in-out"
      },
      keyframes: {
        "from-left": {
          "0%": {
            transform: "translate(25%, 0)",
            opacity: 0
          },
          "100%": {
            transform: "translate(0,0)",
            opacity: 1
          }
        }
      }
    }
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")]
};

/*
@keyframes FADE_IN_FROM_LEFT {
  0% {
    transform: translate(25%, 0);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}
*/
