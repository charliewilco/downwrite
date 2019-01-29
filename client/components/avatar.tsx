import * as React from "react";
import styled, { css } from "styled-components";

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

const spaced = css`
  margin: 0 auto 1rem;
`;

export interface IAvatarCircleProps {
  colors: IPointedGradientColors;
  centered?: boolean;
  size?: number;
}

const AvatarCircle = styled.div<IAvatarCircleProps>`
  border-radius: 50%;
  height: ${props => props.size || 48}px;
  width: ${props => props.size || 48}px;
  background: linear-gradient(
    135deg,
    ${props => props.colors.a || "#FEB692"} 10%,
    ${props => props.colors.b || "#EA5455"} 100%
  );

  ${props => props.centered && spaced};
`;

interface IAvatarProps {
  colors: GradientColors;
  size?: number;
  centered?: boolean;
  className?: string;
}

const Avatar: React.FC<IAvatarProps> = props => (
  <AvatarCircle
    className={props.className}
    size={props.size}
    centered={props.centered}
    colors={gradientPoints(props.colors)}
  />
);

export default Avatar;
