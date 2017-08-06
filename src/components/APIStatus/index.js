import React from 'react'
import { Block } from 'glamor/jsxstyle'

const pos = {
  bottom: 8,
  right: 8,
  position: 'fixed'
}

export default ({ data, env }) => (
  <Block fontSize={12} background='#CF4832' color='white' textAlign='center' padding={8} {...pos} opacity='.375'>
    {data && (<span>{data.post} {env}</span>)}
  </Block>
)
