module.exports = {
  purge: [
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      mono: ["Roboto Mono", "monospace"]
    },
    extend: {
      colors: {
        accent: {
          "200": "#6ca4ff",
          "400": "#0f76ff",
          "700": "#004ccb"
        },
        blk: {
          "800": "#1E1E1E",
          "900": "#121212"
        }
      },
      maxWidth: {
        xxs: "16rem"
      }
    }
  },
  variants: {},
  plugins: []
};
