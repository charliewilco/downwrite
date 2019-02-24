import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";

export const LevelStyles = function() {
  return (
    <style jsx global>{`
      *,
      *::before,
      *::after {
        box-sizing: inherit;
        margin: 0;
        padding: 0;
      }

      html {
        height: 100%;
        tab-size: 2;
        box-sizing: border-box;
        text-size-adjust: 100%;
        background-color: #f9fbfc;
        font: 400 100%/1.6 ${DefaultStyles.fonts.sans};
        color: ${DefaultStyles.colors.text};
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
      }

      body {
        display: flex;
        flex-direction: column;
      }

      body,
      #__next {
        width: 100%;
        height: 100%;
      }

      #__next {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
      }
    `}</style>
  );
};
