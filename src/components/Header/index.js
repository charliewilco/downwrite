import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../Nav'
import Logo from '../Logo'

import { StyleSheet, css } from 'aphrodite/no-important'
import { Flex } from 'jsxstyle'

const styles = StyleSheet.create({
  Header: {
    backgroundColor: `var(--color-1)`,
    backgroundImage: `linear-gradient(to right, #2584A5 0%, #4FA5C2 100%)`,
    padding: 16
  },
  title: {
    fontSize: '112.5%',
    fontWeight: 400,
    marginLeft: 16,
    lineHeight: 1
  },
  link: {
    color: 'white',
    display: 'block',
    transition: 'color 375ms ease-in-out',
    ':hover': {
      color: `var(--color-2)`
    }
  }
})

const Header = ({ name }) =>
  <Flex component='header' className={css(styles.Header)} justifyContent='space-between' alignItems='center'>
    <Flex className='Header__logo Header__link' alignItems='center'>
      <Logo />
      <h1 className={css(styles.title)}>
        <Link className={css(styles.link)} to='/'>{name}</Link>
      </h1>
    </Flex>
    <Nav />
  </Flex>

export default Header
