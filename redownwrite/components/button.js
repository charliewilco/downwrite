// @flow

import styled from 'styled-components'
import { colors } from '../utils/defaultStyles'

export default styled.button`
  background-color: ${colors.yellow700};
  border-radius: 0.25rem;
  border: 0;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.037), 0 4px 8px rgba(0, 0, 0, 0.07);
  box-sizing: inherit;
  color: #282828;
  display: block;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: inherit;
  padding: 0.25rem 1.125rem;
  transition: background-color 250ms ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${colors.yellow500};
  }

  &[disabled] {
    filter: grayscale(100%);
  }
`
