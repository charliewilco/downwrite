import React from 'react'
import { Block } from 'glamor/jsxstyle'

export default ({ sm, xs, ...props }) => (
  <Block
    maxWidth={sm ? 768 : xs ? 384 : 1088}
    marginRight="auto"
    marginLeft="auto"
    {...props}
  />
)
