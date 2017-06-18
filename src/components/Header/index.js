import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../Nav'
import Logo from '../Logo'
import { css } from 'glamor'
import { Flex } from 'glamor-jsxstyle'

const link = css({
  fontSize: 20,
  fontWeight: 400,
  marginLeft: 16,
  lineHeight: 1,
  color: 'white',
  display: 'block',
  transition: 'color 375ms ease-in-out',
  '&:hover': {
    color: `var(--color-2)`
  }
})

const Header = ({ name }) =>
  <Flex
    component='header'
    padding={16}
    background={`var(--color-1) linear-gradient(to right, #2584A5, #4FA5C2)`}
    justifyContent='space-between'
    alignItems='center'>
    <Flex className='Header__logo Header__link' alignItems='center'>
      <Logo />
      <h1>
        <Link className={css(link)} to='/'>{name}</Link>
      </h1>
    </Flex>
    <Nav />
  </Flex>

export default Header
