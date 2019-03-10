import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <>
      <button {...props} />
      <style jsx>{`
        button {
          background-color: ${DefaultStyles.colors.yellow700};
          border-radius: 0.25rem;
          border: 0;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.037), 0 4px 8px rgba(0, 0, 0, 0.07);
          box-sizing: inherit;
          color: #282828;
          display: block;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          line-height: inherit;
          padding: 0.25rem 1.125rem;
          transition: background-color 250ms ease-in-out;
          cursor: pointer;
        }

        button:hover {
          background-color: ${DefaultStyles.colors.yellow500};
        }

        button[disabled] {
          filter: grayscale(100%);
        }
      `}</style>
    </>
  );
}

export function AltButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <>
      <button {...props} />

      <style jsx>{`
        button {
          margin-right: 1rem;
          color: ${DefaultStyles.colors.blue700};
          background: none;
          font-family: inherit;
          font-size: 100%;
          border: 0px;
          font-weight: 700;
          box-sizing: inherit;
        }
      `}</style>
    </>
  );
}

export function CancelButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <>
      <button {...props} />
      <style jsx>{`
        button {
          margin-right: 1rem;
          color: ${DefaultStyles.colors.blue700};
          background: none;
          font-family: inherit;
          font-size: 100%;
          border: 0px;
          font-weight: 700;
          box-sizing: inherit;
        }
      `}</style>
    </>
  );
}
