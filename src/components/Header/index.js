import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../Nav'
import Logo from '../Logo'

import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  Header: {
    backgroundColor: `var(--color-1)`,
    backgroundImage: `linear-gradient(to right, #2584A5 0%, #4FA5C2 100%)`
  },
  title: {
    fontSize: '1.25rem',
    marginLeft: '1rem',
    lineHeight: 1
  },
  link: {
    color: 'white',
    display: 'block'
  }
})

const Header = props =>
  <header className={`${css(styles.Header)} Flex Flex--between Flex--center--h u-p2`}>
    <div className='Header__logo Header__link Flex Flex--center--h'>
      <Logo />
      <h1 className={css(styles.title)}>
        <Link className={css(styles.link)} to='/'>{props.name}</Link>
      </h1>
    </div>
    <Nav />
  </header>

export default Header
