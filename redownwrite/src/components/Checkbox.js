import React from 'react'
import styled from 'styled-components'

const icon = `data:image/svg+xml;utf8,<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
<path fill='white' d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z "></path></svg>`

const Inp = styled.input`
  display: inline-block;
  border-radius: 4px;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  appearance: none;
  border: 0px;
  background: ${({ checked }) =>
    checked ? `var(--color-1) url(${icon}) no-repeat center center` : '#D0D0D0'};
`

export default props => <Inp type="checkbox" {...props} />
