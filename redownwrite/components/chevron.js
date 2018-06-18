// @flow

import React from 'react'
import styled from 'styled-components'

const Icon = styled.svg`
  width: 16px;
  height: 16px;
  fill: none;
`

export default ({ open }: { open: boolean }) => (
  <Icon viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path
      d={
        open
          ? 'M1.0606601717798212 11 L8 4.060660171779821 L14.939339828220179 11'
          : 'M1.0606601717798212 5 L8 11.939339828220179 L14.939339828220179 5'
      }
    />
  </Icon>
)
