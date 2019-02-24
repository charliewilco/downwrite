import * as React from "react";
// import css from "styled-jsx/css";
import * as DefaultStyles from "../utils/defaultStyles";

interface AltAnchorProps<T> extends React.AnchorHTMLAttributes<T> {
  space?: string;
}

export default function AltAnchorLink({ space, ...props }: AltAnchorProps<any>) {
  return (
    <>
      <style jsx>{`
        a {
          font-size: 14px;
          cursor: pointer;
          line-height: 1.1;
          opacity: 0.5;
          color: var(--color) !important;
        }

        a:focus {
          color: ${DefaultStyles.colors.text};
          opacity: 1;
        }
      `}</style>
      <a {...props} />
    </>
  );
}
