import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Router from 'next/router'
import Wrapper from './wrapper'
import Button from './button'
import Nib from './nib'

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

const GetStarted = styled.a`
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

export const SidebarEmpty = () => (
  <Flex centered>
    <Button onClick={() => Router.push('/new')}>Get Started</Button>
  </Flex>
)

export default () => (
  <SpacedWrapper>
    <Flex>
      <EmptyBlockRight>
        <Nib />
      </EmptyBlockRight>
      <EmptyBlockLeft>
        <EmptyTitle>Looks like you don't have any entries</EmptyTitle>
        <Link href="/new">
          <GetStarted>Get Started &rarr;</GetStarted>
        </Link>
      </EmptyBlockLeft>
    </Flex>
  </SpacedWrapper>
)
