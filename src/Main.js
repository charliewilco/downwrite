import React from 'react'
import Card from './components/Card'
import Loading from './components/Loading'
import { css } from 'glamor'
import { Block, Flex } from 'glamor-jsxstyle'

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

const List = ({ posts }) => (
  <Block>
    <h1 className={css(s.title)}>Posts</h1>
    <Flex component='ul' flexWrap='wrap' margin='0 -20px' listStyle='none inside'>
      {posts.map(p => <Card className={css(s.item)} key={p.id} {...p} />)}
    </Flex>
  </Block>
)

const Empty = () => (
  <Block>
    <h2>No Posts</h2>
    <p>Maybe you should start writing?</p>
  </Block>
)

export default ({ posts, loaded }) =>
  <Block padding={16} height='100%'>
    {
      loaded
      ? (posts.length > 0 ? <List posts={posts} /> : <Empty />)
      : <Loading size={100} />
    }
  </Block>
