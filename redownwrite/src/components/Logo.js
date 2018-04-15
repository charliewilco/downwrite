import React from 'react'
import styled from 'styled-components'
import logo from './logo.svg'

const Image = styled.img`
  max-width: 20px;

  @media (min-width: 57.75rem) {
    max-width: 33px;
  }
`

const Logo = () => <Image src={logo} alt="logo" />

export default Logo
