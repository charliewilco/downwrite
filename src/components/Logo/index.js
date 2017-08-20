import React from 'react'
import { css } from 'glamor'
import logo from './logo.svg'

const logoStyle = css({
  maxWidth: 20,
  '@media (min-width: 57.75rem)': { maxWidth: 33 }
})

const Logo = () => <img className={logoStyle} src={logo} alt='logo' />

export default Logo
