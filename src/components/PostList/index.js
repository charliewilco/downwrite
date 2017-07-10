import React from 'react'
import { css } from 'glamor'
import { Flex, Block } from 'glamor-jsxstyle'
import Card from '../Card'

const s = {
  main: css({
    paddingTop: 16,
    marginBottom: 24,
    fontWeight: 400
  }),
  title: css({
    fontSize: 40,
    marginBottom: 24
  }),
  item: css({
    marginBottom: 24,
    width: '100%',
    '@media (min-width:31.25rem)': { width: '50%' },
    '@media (min-width: 48rem)': { width: `${100/3}%` },
    '@media (min-width: 57.75rem)': { width: '25%' }
  })
}

export default ({ posts }) => (
  <Block>
    <h1 className={css(s.title)}>Posts</h1>
    <Flex component='ul' flexWrap='wrap' margin='0 -20px' listStyle='none inside'>
      {posts.map(
        p => (
          <Block key={p.id} component='li' padding='0 20px' className={css(s.item)}>
            <Card {...p} />
          </Block>
        )
      )}
    </Flex>
  </Block>
)
