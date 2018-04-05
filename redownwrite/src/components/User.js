// @flow
import React from 'react'
import styled from 'styled-components'
import Avatar from './Avatar'

type UserBlock = { username: string }

const UserBlockContainer = styled.div`
  text-align: center;
  padding: 32px 8px;
  border-bottom: 1px solid #dbdcdd;
`

const DisplayUser = styled.span`
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
`

export default ({ username }: UserBlock) => (
  <UserBlockContainer>
    <Avatar />
    <DisplayUser>{username}</DisplayUser>
  </UserBlockContainer>
)
