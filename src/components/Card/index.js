import React from 'react'
import { Flex, Block } from 'glamor-jsxstyle'
import { Link } from 'react-router-dom'
import { css } from 'glamor'

let titleStyle = css({
  fontSize: 24,
  fontWeight: 400
})

let bodyStyle = css({
  fontSize: `small`,
  opacity: 0.5
})

let cardStyle = {
  borderLeftWidth: 8,
  borderLeftStyle: 'solid',
  borderColor: `var(--color-1)`,
  boxShadow: '0 0 4px rgba(0,0,0,.07), 0 4px 8px rgba(0,0,0,.14)',
  backgroundColor: 'white'
}

const Card = ({ tag, title, id, author, className, ...args }) => (
  <Block component={tag} className={css(className, cardStyle)} padding={20} {...args}>
    <Flex borderBottom='1px solid #f2f2f2' paddingBottom={20} marginBottom={16} justifyContent='space-between' alignItems='center'>
      <div>
        <h2 className={titleStyle}>{title} - {id}</h2>
        <small children={author} />
      </div>
      <Link to={`edit/${id}`}>Edit</Link>
    </Flex>
    {/* <p className={bodyStyle}>{body}</p> */}
  </Block>
)

export default Card
