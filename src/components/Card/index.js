import React from 'react'
import { Flex, Block } from 'jsxstyle'
import { Link } from 'react-router-dom'
import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  title: {
    fontSize: 20
  },
  body: {
    fontSize: `small`
  },
  card: {
    borderLeft: `3px solid var(--color-1)`
  }
})

const Card = ({ tag, title, id, body, author }) => (
  <Block
    component={tag}
    className={css(styles.card)}
    backgroundColor='white'
    boxShadow='0 0 4px rgba(0,0,0,.07), 0 4px 8px rgba(0,0,0,.14)'
    padding={16}>
    <Flex justifyContent='space-between' alignItems='center'>
      <h2 className={css(styles.title)}>{title} - {id} <small children={author} /></h2>
      <Link to={`edit/${id}`}>Edit</Link>
    </Flex>
    <p className={css(styles.body)}>{body}</p>
  </Block>
)

export default Card
