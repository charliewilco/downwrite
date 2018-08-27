// @flow
import React from 'react'
import styled, { css } from 'styled-components'
import Avatar from './avatar'

type UserBlock = { name: string }

const border = css`
  border-bottom: 1px solid ${props => props.theme.border};
`

const UserBlockContainer = styled.div`
  text-align: center;
  padding: 32px 8px;
  ${props => props.border && border};
`

const DisplayUser = styled.span`
  display: inline-block;
  font-size: 16px;
  font-weight: 700;
`

export default ({ name, border, colors }: UserBlock) => (
  <UserBlockContainer border={border}>
    <Avatar centered colors={colors} />
    <DisplayUser>{name}</DisplayUser>
  </UserBlockContainer>
)
