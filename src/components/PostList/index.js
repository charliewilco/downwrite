import React from 'react'
import { css } from 'glamor'
import { Flex, Block } from 'glamor/jsxstyle'
import Card from '../Card'

const s = {
  main: css({
    paddingTop: 16,
    marginBottom: 24,
    fontWeight: 400
  }),
  title: css({
    fontSize: 36,
    fontWeight: 400,
    marginBottom: 24
  }),
  item: css({
    marginBottom: 24,
    width: '100%',
    padding: '0 15px',
    '@media (min-width: 48rem)': { width: '50%' },
    '@media (min-width: 57.75rem)': { width: `${100 / 3}%` },
    '@media (min-width: 75rem)': { width: `${100 / 4}%` }
  })
}

export default ({ posts }) => (
  <Block>
    <h1 className={css(s.title)}>Posts</h1>
    <Flex
      component='ul'
      flexWrap='wrap'
      margin='0 -15px'
      listStyle='none inside'>
      {posts.map(p => (
        <Block key={p.id} component='li' className={css(s.item)}>
          <Card {...p} />
        </Block>
      ))}
    </Flex>
  </Block>
)
