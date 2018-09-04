import * as React from 'react'
import styled, { css } from 'styled-components'

export type GradientColors = string[]

export const AvatarColors: GradientColors = ['#FEB692', '#EA5455']

export interface IPointedGradientColors {
  a: string;
  b: string;
}

export const gradientPoints = (colors: GradientColors = AvatarColors) => ({
  a: colors[0],
  b: colors[1]
})

const spaced = css`
  margin: 0 auto 1rem;
`

export interface IAvatarProps {
  colors: IPointedGradientColors;
  centered: boolean;
}

const AvatarCircle = styled.div`
  border-radius: 3rem;
  height: 3rem;
  width: 3rem;
  background: linear-gradient(
    135deg,
    ${(props: IAvatarProps) => props.colors.a || '#FEB692'} 10%,
    ${(props: IAvatarProps) => props.colors.b || '#EA5455'} 100%
  );

  ${(props: IAvatarProps) => props.centered && spaced};
`

const Avatar: React.SFC<{ colors: GradientColors, centered: boolean }> = ({
  colors,
  centered
}) => <AvatarCircle centered={centered} colors={gradientPoints(colors)} />

export default Avatar
