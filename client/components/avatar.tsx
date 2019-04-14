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
  const cx = classNames(
    "AvatarCircle",
    props.className,
    props.centered && "AvatarCircle--centered"
  );

  const colors = gradientPoints(props.colors);

  const styles = {
    "--size": props.size || 48,
    "--colors-a": colors.a,
    "--colors-b": colors.b
  } as React.CSSProperties;

  return (
    <>
      <div role="image" className={cx} style={styles} />
    </>
  );
}
