import React from 'react'
import styled from 'styled-components'
import { Link, withRouter } from 'react-router-dom'
import Wrapper from './Wrapper'
import Button from './Button'
import Nib from './Nib'

const EmptyBlock = styled.div`
  flex: 1;
`
const EmptyBlockRight = EmptyBlock.extend`
  margin-right: 16;
`

const EmptyBlockLeft = EmptyBlock.extend`
  margin-left: 16;
`

const SpacedWrapper = Wrapper.extend`
  padding-top: 64px;
`

const GetStarted = styled(Link)`
  color: #757575;
`

const Flex = styled.div`
  display: flex;
  justify-content: ${({ centered }) => (centered ? 'center' : 'flex-start')};
`

const EmptyTitle = styled.h4`
  font-size: 24px;
  margin-bottom: 16px;
`

export const SidebarEmpty = withRouter(({ history }) => (
  <Flex centered>
    <Button onClick={() => history.replace('/new')}>Get Started</Button>
  </Flex>
))

export default () => (
  <SpacedWrapper>
    <Flex>
      <EmptyBlockRight>
        <Nib />
      </EmptyBlockRight>
      <EmptyBlockLeft>
        <EmptyTitle>Looks like you don't have any entries</EmptyTitle>
        <GetStarted to="/new">Get Started &rarr;</GetStarted>
      </EmptyBlockLeft>
    </Flex>
  </SpacedWrapper>
)
