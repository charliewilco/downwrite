import React from 'react'
import { Link } from 'react-router-dom'
import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  button: {
    backgroundColor: `var(--color-3)`,
    padding: 8,
    borderRadius: 4
  }
})

const Nav = props =>
  <nav>
    <Link to='/new' className={css(styles.button)}>New</Link>
  </nav>

export default Nav
