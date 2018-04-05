import React from 'react'
import styled, { css } from 'styled-components'

const activeMarker = css`
  &:after {
    content: '';
    display: block;
    border-bottom: 5px solid var(--link);
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
    <LayoutTrigger
      active={layout === 'grid'}
      onClick={() => layoutChange('grid')}
      children="Grid"
    />
    <LayoutTrigger
      active={layout === 'list'}
      onClick={() => layoutChange('list')}
      children="List"
    />
  </Box>
)

export default LayoutControl
