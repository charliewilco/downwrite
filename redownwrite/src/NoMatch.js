// @flow

import React from 'react'
import styled from 'styled-components'
import Wrapper from './components/Wrapper'

type NoMatchType = {
  location: {
    pathname: string
  }
}

const CenteredWrapper = styled(Wrapper)`
  text-align: center;
  padding: 8rem 1rem;
`

const Title = styled.h2`
  display: inline-block;
  margin-bottom: 32px;
  font-size: 84px;
  line-height: 1;
  font-weight: 100;
`

export default ({ location }: NoMatchType) => (
  <CenteredWrapper>
    <Title children="404" />
    <p>Sorry but {location.pathname} didn’t match any pages</p>
  </CenteredWrapper>
)
