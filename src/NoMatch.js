import React from 'react'
import Wrapper from './components/Wrapper'
import { InlineBlock as In } from 'glamor-jsxstyle'

export default ({ location }) => (
  <div>
    <Wrapper textAlign='center' padding={`8rem 1rem`}>
      <In component='h2' marginBottom={32} fontWeight={100} fontSize={84} lineHeight={1}>
        404
      </In>
      <p>
        Sorry but {location.pathname} didn’t match any pages
      </p>
    </Wrapper>
  </div>
)
