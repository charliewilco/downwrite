import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";
import classNames from "../utils/classnames";

// TODO: container should have the positioning
// Should be UI style and layout style from container

export default function Toast({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <div {...props} className={classNames("Toast", className)} />
      <style jsx>{`
        .Toast {
          color: ${DefaultStyles.colors.text};
          width: 10rem;
          text-align: center;
          top: 20px;
          left: 0;
          right: 0;
          z-index: 900;
          position: fixed;
          margin: auto;
          background-color: white;
          font-weight: 700;
          box-shadow: var(--shadow);
          padding: 0.25rem;
        }
      `}</style>
    </>
  );
}

export function ToastNoPosition({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <div {...props} className={classNames("ToastNoPosition", className)} />
      <style jsx>{`
        .ToastNoPosition {
          color: ${DefaultStyles.colors.text};
          background-color: white;
          box-shadow: var(--shadow);
          padding: 0.25rem;
        }
      `}</style>
    </>
  );
}
