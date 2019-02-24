import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <>
      <input type="text" {...props} />
      <style jsx>{`
        input {
          display: block;
          width: 100%;
          appearance: none;
          font-weight: 400;
          color: inherit;
          font-family: ${DefaultStyles.fonts.sans};
          background: none;
          font-size: 150%;
          border-width: 0px;
          border-bottom: 1px;
          border-style: solid;
          border-radius: 0px;
          border-color: var(--inputBorder);
          padding-left: 0px;
          padding-right: 0px;
          padding-top: 8px;
          padding-bottom: 8px;
          outline: none;
          transition: border-color 250ms linear;
        }

        input:focus {
          border-color: var(--link);
        }
      `}</style>
    </>
  );
}
