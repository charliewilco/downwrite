import * as React from "react";

interface ISpinnerProps {
  size: number;
  color?: string;
  delay?: string;
}

export default function Spinner({ size, color }: ISpinnerProps): JSX.Element {
  return (
    <div role="image">
      <div className="InnerRing" style={{ animationDelay: "-0.6s " }} />
      <div className="InnerRing" style={{ animationDelay: "-0.4s " }} />
      <div className="InnerRing" style={{ animationDelay: "-0.2s " }} />

      <style jsx>{`
        @keyframes RIPPLE {
          0% {
            transform: ${`scale(0.1)`};
            opacity: 1;
          }

          70% {
            transform: ${`scale(1)`};
            opacity: 0.7;
          }

          100% {
            opacity: 0;
          }
        }

        .OuterRing {
          position: relative;
          margin: auto;
          color: ${color};
          transform: translateY(${size / 2}px);
        }

        .InnerRing {
          position: absolute;
          top: -2px;
          left: ${size / -2 + 1}px;
          width: ${size}px;
          height: ${size}px;
          border-radius: ${`100%`};
          border: 2px solid currentColor;
          animation-fill-mode: both;
          animation: RIPPLE 1.25s 0s infinite cubic-bezier(0.21, 0.53, 0.56, 0.8);
        }
      `}</style>
    </div>
  );
}
