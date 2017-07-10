import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../Nav'
import Logo from '../Logo'
import { css } from 'glamor'
import { Flex, Row } from 'glamor/jsxstyle'

const hSty = {
  link: css({
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
  }),
  bar: css({
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    background: `var(--color-1) linear-gradient(to right, #2584A5, #4FA5C2)`
  })
}

const Header = ({ name }) =>
  <Row component='header' className={css(hSty.bar)}>
    <Flex alignItems='center'>
      <Logo />
      <h1>
        <Link className={css(hSty.link)} to='/'>{name}</Link>
      </h1>
    </Flex>
    <Nav />
  </Row>

export default Header
