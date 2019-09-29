import * as React from "react";

interface ILoadingProps {
  size: number;
  color?: string;
  delay?: string;
}

export default function Loading(props: ILoadingProps): JSX.Element {
  return (
    <div
      role="image"
      className="Loading"
      style={
        { "--size": props.size || 75, height: props.size } as React.CSSProperties
      }
      data-testid="LOADING_SPINNER">
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
