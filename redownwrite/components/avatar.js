import React, { Component } from 'react'
import styled, { css } from 'styled-components'

export const AvatarColors = ['#FEB692', '#EA5455']

export const gradientPoints = (colors = AvatarColors) => ({
  a: colors[0],
  b: colors[1]
})

const spaced = css`
  margin: 0 auto 1rem;
`

const AvatarCircle = styled.div`
  border-radius: 3rem;
  height: 3rem;
  width: 3rem;
  background: linear-gradient(
    135deg,
    ${props => props.colors.a || '#FEB692'} 10%,
    ${props => props.colors.b || '#EA5455'} 100%
  );

  ${props => props.centered && spaced};
`

export default ({ colors, centered }) => (
  <AvatarCircle centered={centered} colors={gradientPoints(colors)} />
)
