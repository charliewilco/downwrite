import React from 'react'
import styled from 'styled-components'
import PrismCode from 'react-prism'
import { fonts } from '../utils/defaultStyles'

const StyledPrism = styled(PrismCode)`
  font-family: ${fonts.code};
`

const CodeBlock = ({ language = 'javascript', value }) => (
  <pre>
    <StyledPrism className={`language-${language || 'javascript'}`}>
      {value}
    </StyledPrism>
  </pre>
)

export default CodeBlock
