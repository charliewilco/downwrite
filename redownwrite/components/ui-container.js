import React from 'react'
import styled from 'styled-components'
import { fonts } from '../utils/defaultStyles'

export default styled.div`
  font-family: ${fonts.monospace};
  color: ${props => props.theme.color};
  background: ${props => props.theme.background};
  display: flex;
  flex-direction: column;
  flex: 1;
  a {
    background-color: transparent;
    text-decoration: none;
    color: ${props => props.theme.link};
  }

  a:active,
  a:hover {
    color: ${props => props.theme.linkHover};
    outline: 0;
  }
`
