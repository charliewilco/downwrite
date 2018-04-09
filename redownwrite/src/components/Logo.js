import React from 'react'
import styled from 'styled-components'

const Image = styled.img`
  max-width: 20px;

  @media (min-width: 57.75rem) {
    max-width: 33px;
  }
`

const Logo = () => <Image src={process.env.PUBLIC_URL + '/logo.svg'} alt="logo" />

export default Logo
