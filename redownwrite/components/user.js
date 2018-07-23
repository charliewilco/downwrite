// @flow
import React from 'react'
import styled from 'styled-components'
import Avatar from './avatar'

type UserBlock = { name: string }

const UserBlockContainer = styled.div`
  text-align: center;
  padding: 32px 8px;
  border-bottom: 1px solid ${props => props.theme.border};
`

const DisplayUser = styled.span`
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
`

export default ({ name }: UserBlock) => (
  <UserBlockContainer>
    <Avatar />
    <DisplayUser>{name}</DisplayUser>
  </UserBlockContainer>
)
