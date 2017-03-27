import React from 'react'
import { Link } from 'react-router-dom'
import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  nav: {
    backgroundColor: `var(--color-2)`
  }
})

const Nav = props =>
  <nav className={css(styles.nav)}>
    <Link to='/new'>New</Link>
  </nav>

export default Nav
