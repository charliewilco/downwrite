import 'typeface-hind'
import React from 'react'
import uuid from 'uuid/v4'
import Card from './components/Card'
import { css } from 'glamor'
import { Block, Flex } from 'glamor-jsxstyle'

let itemSty = css({
  width: '100%',
  marginBottom: 24,
  maxWidth: 400
})

let mainTitle = css({
  paddingTop: 16,
  marginBottom: 24,
  fontSize: 40,
  fontWeight: 400
})

const MainView = ({ posts }) =>
  <Block fontFamily='Hind' padding={16}>
    <h1 className={css(mainTitle)}>Posts</h1>
    {posts.length > 0 ? (
        <Flex component='ul' justifyContent='space-between' flexWrap='wrap' listStyle='none inside'>
          {posts.map(p => <Card tag='li' className={css(itemSty)} key={uuid()} {...p} />)}
        </Flex>
      ) : <h2>No Posts</h2>}
  </Block>

export default MainView
