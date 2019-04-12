import * as React from "react";
import classNames from "../utils/classnames";

export type GradientColors = string[];

export const AvatarColors: GradientColors = ["#FEB692", "#EA5455"];

export interface IPointedGradientColors {
  a: string;
  b: string;
}

export const gradientPoints = (colors: GradientColors = AvatarColors) => ({
  a: colors[0],
  b: colors[1]
});

export interface IAvatarCircleProps {
  colors: IPointedGradientColors;
  centered?: boolean;
  size?: number;
}

interface IAvatarProps {
  colors: GradientColors;
  size?: number;
  centered?: boolean;
  className?: string;
}

export default function Avatar(props: IAvatarProps): JSX.Element {
  const cx = classNames("circle", props.className, props.centered && "centered");
  const colors = gradientPoints(props.colors);
  return (
    <>
      <div role="image" className={cx} />
      <style jsx>{`
        .circle {
          border-radius: 50%;
          height: ${props.size || 48}px;
          width: ${props.size || 48}px;
          background: linear-gradient(
            135deg,
            ${colors.a || "#FEB692"} 10%,
            ${colors.b || "#EA5455"} 100%
          );
        }

        .centered {
          margin: 0 auto 1rem;
        }
      `}</style>
    </>
  );
}
