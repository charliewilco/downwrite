import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../utils/defaultStyles'

const activeMarker = css`
  opacity: 1;
  &:after {
    content: '';
    display: block;
    border-bottom: 5px solid ${props => props.theme.link || colors.blue400};
  }
`

const Box = styled.div``

const LayoutTrigger = styled.div`
  display: inline-block;
  margin: 8px;
  cursor: pointer;
  font-size: 12px;
  color: inherit;
  opacity: 0.5;
  ${props => props.active && activeMarker};
`

const LayoutControl = ({ layout, layoutChange }) => (
  <Box>
    <LayoutTrigger active={layout === 'grid'} onClick={() => layoutChange('grid')}>
      Grid
    </LayoutTrigger>
    <LayoutTrigger active={layout === 'list'} onClick={() => layoutChange('list')}>
      List
    </LayoutTrigger>
  </Box>
)

export default LayoutControl
