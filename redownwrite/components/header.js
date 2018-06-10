// @flow

import React, { Component } from 'react'
import styled from 'styled-components'
import Link, { withRouter } from 'next/link'
import Logo from './logo'
import Navicon from './navicon'
import { colors } from '../utils/defaultStyles'
import { withAuth } from './auth'

type HeaderProps = {
  authed: boolean,
  name: string,
  onClick: Function,
  open: boolean
}

const MenuContainer = styled.nav`
  display: flex;
  align-items: center;
`

const NewButton = styled.a`
  font-size: 14px;
  cursor: pointer;
  line-height: 1.1;
  opacity: 0.5;
  color: ${colors.text};
  margin-right: 32px;

  &:hover,
  &:focus {
    color: ${colors.text};
    opacity: 1;
  }
`

const HomeButton = styled.a`
  margin-left: 12px;
  display: block;
  cursor: pointer;
  transition: color 375ms ease-in-out;

  &:hover {
    color: ${colors.blue700};
  }
`

const ToggleButton = styled.button`
  appearance: none;
  outline: none;
  border: 0px;
  font-family: inherit;
  background: none;
`

const LoginSignUp = () => (
  <MenuContainer>
    <NewButton to="/">Login or Sign Up</NewButton>
  </MenuContainer>
)

const Menu = ({ toggleNav, open }) => (
  <MenuContainer>
    <Link prefetch href="/new" as="/new">
      <NewButton>New</NewButton>
    </Link>
    <ToggleButton onClick={toggleNav}>
      <Navicon colors={colors} open={open} />
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
  background: ${colors.gray100};
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 8px;
  padding-right: 8px;
`

class UIHeader extends Component {
  render() {
    const { authed, onClick, open, route } = this.props

    const url = !authed
      ? {
          href: '/login',
          as: '/'
        }
      : {
          href: '/',
          as: '/'
        }

    return !(route === '/login' && !authed) ? (
      <Header data-testid="APP_HEADER">
        <MenuContainer>
          <Logo />
          <HeaderTitle data-testid="APP_HEADER_TITLE">
            <Link {...url}>
              <HomeButton>Downwrite</HomeButton>
            </Link>
          </HeaderTitle>
        </MenuContainer>
        {authed ? <Menu open={open} toggleNav={onClick} /> : <LoginSignUp />}
      </Header>
    ) : null
  }
}

export default withAuth(UIHeader)
