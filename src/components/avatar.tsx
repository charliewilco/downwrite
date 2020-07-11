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
  const colors = gradientPoints(props.colors);

  const style: React.CSSProperties = {
    background: `linear-gradient(135deg,
      var(${colors.a}, #feb692) 10%,
      var(${colors.b}, #ea5455) 100%
    )`
  };

  return (
    <div
      className={classNames(
        "rounded-full w-12 h-12",
        props.className,
        props.centered && "mt-0 mx-auto mb-4"
      )}
      style={style}
      role="img"
      aria-label="Gradient in a circle to represent a user"
    />
  );
}
