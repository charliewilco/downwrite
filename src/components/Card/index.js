import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import { Link } from 'react-router-dom'
import { css } from 'glamor'

const s = {
  title: css({
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'var(--secondary-font)',
    '@media (min-width: 57.75rem)': { fontSize: 16 }
  }),
  delete: css({
    color: 'var(--color-2)',
    border: 0,
    appearance: 'none',
    WebkitFontSmoothing: 'antialiased'
  }),
  content: css({
    fontSize: `small`,
    fontFamily: 'var(--secondary-font)',
    opacity: 0.875,
    padding: 16
  }),
  card: css({
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderColor: `var(--color-1)`,
    fontFamily: 'var(--secondary-font)',
    fontWeight: 500,
    boxShadow: '0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)',
    backgroundColor: 'white'
  }),
  meta: css({
    opacity: 0.5,
    fontFamily: 'var(--primary-font)',
    fontWeight: 400
  }),
  edit: css({
    fontSize: 12,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 2,
    '@media (min-width: 57.75rem)': {
      fontSize: 14,
      fontWeight: 700
    }
  })
}

const DeleteButton = ({ onDelete }) => (
  <span className={css(s.edit, s.delete)} onClick={onDelete}>
    Delete
  </span>
)

const Card = ({ title, id, content, author, onDelete }) => (
  <Block className={css(s.card)}>
    <Flex
      borderBottom='1px solid #f2f2f2'
      padding={16}
      justifyContent='space-between'
      alignItems='flex-start'>
      <div>
        <h2 className={s.title}>{title}</h2>
        <small className={s.meta}>{author}</small>
      </div>
      <Flex flexDirection='column' className={css(s.action)}>
        <Link to={`/${id}/edit`} className={s.edit}>
          Edit
        </Link>
        <DeleteButton onDelete={onDelete} />
      </Flex>
    </Flex>

    <Block>
      {content && (
        <p className={s.content}>
          {content.blocks[0].text} {content.blocks[1].text}
        </p>
      )}
    </Block>
  </Block>
)

export default Card
