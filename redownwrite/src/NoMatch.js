// @flow

import React from 'react'
import Wrapper from './components/Wrapper'
import { InlineBlock as In } from 'glamor/jsxstyle'

type NoMatchTitle = { name: string }
type NoMatchType = {
  location: {
    pathname: string
  }
}

const Title = ({ name }: NoMatchTitle) => (
  <In
    component="h2"
    marginBottom={32}
    fontWeight={100}
    fontSize={84}
    lineHeight={1}
    children={name}
  />
)

export default ({ location }: NoMatchType) => (
  <div>
    <Wrapper textAlign="center" padding={`8rem 1rem`}>
      <Title name="404" />
      <p>Sorry but {location.pathname} didn’t match any pages</p>
    </Wrapper>
  </div>
)
