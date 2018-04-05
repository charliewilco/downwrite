import React from 'react'
import styled from 'styled-components'
import icon from './check.svg'

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
