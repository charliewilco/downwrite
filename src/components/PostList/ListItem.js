import React from 'react'
import { css } from 'glamor'
import { Block, Flex } from 'glamor/jsxstyle'
import { Link } from 'react-router-dom'

const f2 = css({
  fontSize: 16,
  fontWeight: 500,
  '@media (min-width: 57.75rem)': { fontSize: 24 },
  '@media (min-width: 75rem)': { fontSize: 40 }
})

const deleteButton = css({
  appearance: 'none',
  border: 0
})

const metadata = css({
  fontSize: 12,
  opacity: 0.5,
  fontFamily: 'var(--primary-font)'
})

const ListItem = ({ title, id, content, author, onDelete }) => (
  <Flex justifyContent='space-between'>
    <Block fontFamily='var(--secondary-font)'>
      <Link to={`/${id}/edit`}>
        <h2 className={css(f2)}>{title}</h2>
      </Link>
      <small className={css(metadata)}>{author}</small>
    </Block>

    <button className={css(deleteButton)} onClick={onDelete}>
      Delete
    </button>
  </Flex>
)

export default ListItem
