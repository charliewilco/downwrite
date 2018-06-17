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
const EmptyBlockRight = styled(EmptyBlock)`
  width: 100%;
  max-width: 384px;
  margin-bottom: 32px;
`

const EmptyBlockLeft = styled(EmptyBlock)`
  text-align: center;
`

const SpacedWrapper = styled(Wrapper)`
  padding-top: 64px;
`

const GetStarted = styled.a`
  color: #757575;
  cursor: pointer;
`

const Flex = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`

const EmptyTitle = styled.h4`
  font-size: 20px;
  margin-bottom: 16px;
`

export const SidebarEmpty = () => (
  <Flex centered>
    <Button onClick={() => Router.push('/new')}>Get Started</Button>
  </Flex>
)

export default () => (
  <SpacedWrapper>
    <Flex centered>
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
