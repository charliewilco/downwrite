// @flow
import React from 'react'
import { InlineBlock, Block } from 'glamor/jsxstyle'
import Avatar from './Avatar'

type UserBlock = { username: string }

export default ({ username }: UserBlock) => (
  <Block
    textAlign="center"
    paddingTop={32}
    paddingBottom={32}
    paddingLeft={8}
    paddingRight={8}
    borderBottom="1px solid #DBDCDD">
    <Avatar />
    <InlineBlock component="span" fontSize={16} fontWeight={700}>
      {username}
    </InlineBlock>
  </Block>
)
