import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../utils/defaultStyles'

const activeMarker = css`
  &:after {
    content: '';
    display: block;
    border-bottom: 5px solid ${colors.blue400};
  }
`

const Box = styled.div``

const LayoutTrigger = styled.div`
  display: inline-block;
  margin: 8px;
  cursor: pointer;
  font-size: 12px;
  color: ${props => (props.active ? '#383838' : '#989898')};
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
