import React from 'react'
import { Block } from 'glamor/jsxstyle'
import { isEmpty } from 'ramda'

const pos = {
  bottom: 8,
  right: 8,
  position: 'fixed'
}

export default ({ data, env }) => (
  <Block
    fontSize={12}
    border='1px solid'
    color={isEmpty(data) ? '#CF4832' : '#29994F'}
    padding={8}
    {...pos}>
    <Block>
      {isEmpty(data) ? 'Something is wrong with the API' : data.post}
    </Block>
    <Block>
      Environment: {env}
    </Block>
  </Block>
)
