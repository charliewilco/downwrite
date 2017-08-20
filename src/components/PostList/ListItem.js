import React from 'react'
import { css } from 'glamor'
import { Block } from 'glamor/jsxstyle'
import { Link } from 'react-router-dom'

const f2 = css({
  fontSize: 16,
  fontWeight: 500,
  '@media (min-width: 57.75rem)': { fontSize: 24 },
  '@media (min-width: 75rem)': { fontSize: 40 }
})

const metadata = css({
  fontSize: 12,
  opacity: 0.5,
  fontFamily: 'var(--primary-font)'
})

const ListItem = ({ title, id, content, author }) => (
  <Block fontFamily='var(--secondary-font)'>
    <Link to={`/${id}/edit`}>
      <h2 className={css(f2)}>{title}</h2>
    </Link>
    <small className={css(metadata)}>{author}</small>
  </Block>
)

export default ListItem
