import React from 'react'
import { Link } from 'react-router-dom'
import { css } from 'glamor'

const navButton = css({
  backgroundColor: `var(--color-3)`,
  padding: 8,
  borderRadius: 4,
  '&:hover': {
    color: 'var(--color-2)'
  }
})

const Nav = props =>
  <nav>
    <Link to='/new' className={css(navButton)}>New</Link>
  </nav>

export default Nav
