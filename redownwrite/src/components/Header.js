// @flow

import React from 'react'
import styled from 'styled-components'
import { withRouter, Link } from 'react-router-dom'
import type { Match } from 'react-router-dom'
import Logo from './Logo'

type HeaderProps = {
  authed: boolean,
  name: string,
  onClick: Function,
  open: boolean,
  match: Match
}

const MenuContainer = styled.nav`
  display: flex;
  align-items: center;
`

const NewButton = styled(Link)`
  font-size: 14px;
  line-height: 1.1;
  opacity: 0.5;
  color: var(--text);
  margin-right: 32px;

  &:hover,
  &:focus {
    color: var(--text);
    opacity: 1;
  }
`

const HomeButton = styled(Link)`
  margin-left: 12px;
  display: block;
  transition: color 375ms ease-in-out;

  &:hover {
    color: ${`var(--color-2)`};
  }
`

const ToggleButton = styled.button`
  appearance: none;
  outline: none;
  border: 0px;
  background: none;
`

const LoginSignUp = () => (
  <MenuContainer>
    <NewButton to="/">Login or Sign Up</NewButton>
  </MenuContainer>
)

const Menu = ({ toggleNav, open }) => (
  <MenuContainer>
    <NewButton to="/new">New</NewButton>
    <ToggleButton onClick={toggleNav}>
      <svg width="20px" height="9px" viewBox="0 0 20 9">
        <desc>Navicon</desc>
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g fill={open ? '#65A3BF' : '#4C4C4C'}>
            <rect id="Rectangle-Copy-3" x="0" y="0" width="20" height="1" />
            <rect
              id="Rectangle-Copy-4"
              x={open ? 0 : 10}
              y="4"
              width={open ? 20 : 10}
              height="1"
            />
            <rect
              id="Rectangle-Copy-5"
              x={open ? 0 : 5}
              y="8"
              width={open ? 20 : 15}
              height="1"
            />
          </g>
        </g>
      </svg>
    </ToggleButton>
  </MenuContainer>
)

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-style: normal;
  line-height: 1;
  font-weight: 500;

  @media (min-width: 57.75rem) {
    font-size: 20px;
  }
`

const Header = styled.header`
  display: flex;
  background: #f9fbfc;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 8px;
  padding-right: 8px;
`

export default withRouter(
  ({ authed, onClick, open, match }: HeaderProps) =>
    !(match.isExact && match.path === '/' && !authed) ? (
      <Header>
        <MenuContainer>
          <Logo />
          <HomeButton to="/">
            <HeaderTitle>Downwrite</HeaderTitle>
          </HomeButton>
        </MenuContainer>
        {authed ? <Menu open={open} toggleNav={onClick} /> : <LoginSignUp />}
      </Header>
    ) : (
      <div />
    )
)
