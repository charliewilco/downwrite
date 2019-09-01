import * as React from "react";

interface ILoadingProps {
  size: number;
}

interface ISpinnerProps {
  size: number;
  color?: string;
  delay?: string;
}

export function Spinner(props: ISpinnerProps): JSX.Element {
  return (
    <div role="image">
      <div
        className="InnerRing"
        style={
          { "--size": props.size, animationDelay: "-0.6s" } as React.CSSProperties
        }
      />
      <div
        className="InnerRing"
        style={
          { "--size": props.size, animationDelay: "-0.4s" } as React.CSSProperties
        }
      />
      <div
        className="InnerRing"
        style={
          { "--size": props.size, animationDelay: "-0.2s" } as React.CSSProperties
        }
      />
    </div>
  );
}

export default function Loading(props: ILoadingProps): JSX.Element {
  return (
    <div
      className="Loading"
      style={{ "--size": props.size || 75 } as React.CSSProperties}
      data-testid="LOADING_SPINNER">
      <Spinner size={props.size || 75} />
    </div>
  );
}
