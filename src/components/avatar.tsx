import { useMemo } from "react";
import classNames from "@utils/classnames";
import { AvatarColors, Gradient } from "@utils/default-styles";

export interface IPointedGradientColors {
  a: string;
  b: string;
}

export const gradientPoints = (colors: Gradient = AvatarColors) => ({
  a: colors[0],
  b: colors[1]
});

export interface IAvatarCircleProps {
  colors: IPointedGradientColors;
  centered?: boolean;
  size?: number;
}

interface IAvatarProps {
  colors: Gradient;
  size?: number;
  centered?: boolean;
  className?: string;
}

export function Avatar(props: IAvatarProps): JSX.Element {
  const style = useMemo<React.CSSProperties>(() => {
    const colors = gradientPoints(props.colors);
    return {
      background: `linear-gradient(135deg, ${colors.a} 10%, ${colors.b} 100%)`
    };
  }, [props.colors]);

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
