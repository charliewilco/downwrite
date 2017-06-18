import React from 'react'
import { Flex, Block } from 'glamor-jsxstyle'
import { Link } from 'react-router-dom'
import { css } from 'glamor'

const s = {
  title: css({
    fontSize: 24,
    fontWeight: 600
  }),
  body: css({
    fontSize: `small`,
    opacity: 0.875,
    padding: 16
  }),
  card: css({
    borderLeftWidth: 8,
    borderLeftStyle: 'solid',
    borderColor: `var(--color-1)`,
    boxShadow: '0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)',
    backgroundColor: 'white'
  }),
  meta: css({
    opacity: .5
  })
}

const Card = ({ title, id, content, author, className, ...props }) => (
  <Block component='li' padding='0 20px' className={className}>
    <Block className={css(s.card)} {...props}>
      <Flex borderBottom='1px solid #f2f2f2' padding={16} justifyContent='space-between' alignItems='flex-start'>
        <div>
          <h2 className={s.title}>{title}</h2>
          <small className={s.meta}>
            {author} - {id}
          </small>
        </div>
        <Link to={`edit/${id}`}>Edit</Link>
      </Flex>
      {content && <p className={s.body}>{content.slice(0, 90)}...</p>}
    </Block>
  </Block>
)

export default Card
