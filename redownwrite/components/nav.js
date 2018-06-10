// @flow
import React, { Component } from 'react'
import Link from 'next/link'
import { withRouter } from 'next/router'
import styled, { keyframes } from 'styled-components'
import { withAuth } from './auth'
import User from './user'
import Fetch from './collection-fetch'
import SignoutIcon from './signout-icon'
import { SidebarEmpty } from './empty-posts'
import SidebarPosts from './sidebar-posts'
import TouchOutside from './touch-outside'
import LockScroll from './lock-scroll'
import { colors } from '../utils/defaultStyles'

const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (min-width: 500px) {
    justify-content: space-between;
  }
`

const NavButton = styled.button`
  display: block;
  color: #757575;
  font-size: 12px;
  border: 0;
  appearance: none;
  font-family: inherit;
  & + & {
    margin-bottom: 8px;
  }

  &:hover {
    color: ${colors.blue700};
  }
`

const NavLink = styled.a`
  display: block;
  color: #757575;
  font-size: 12px;
  & + & {
    margin-bottom: 8px;
  }

  &:hover {
    color: ${colors.blue700};
  }
`

const PostListContainer = styled.div`
  padding: 8px;

  @media (min-width: 500px) {
    flex: 1;
  }
`

const fadeInFromLeft = keyframes`
  0% {
    transform: translate(25%, 0);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
`

const Nav = styled.nav`
  display: flex;
  animation: ${fadeInFromLeft} 0.45s;
  width: 75%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background: white;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;

  @media (min-height: 500px) {
    width: 384px;
  }
`

const NavTray = styled.footer`
  border-top: 1px solid #dbdcdd;
  text-align: right;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const NavItem = styled.a`
  display: block;
  color: ${colors.gray300};
  font-size: 16px;
  padding-top: 4px;
  padding-bottom: 4px;
  & + & {
    margin-bottom: 8px;
  }

  &:hover {
    color: ${colors.blue700};
  }
`

const UserActionContainer = styled.div`
  padding: 16px 8px;
`

// TODO: Slide to close navigation?

type NavigationProps = {
  token: string,
  username: string,
  closeNav: Function
}

const NavLabel = styled.span`
  display: inline-block;
  vertical-align: middle;
`

const SignOut = withAuth(({ signOut, children }) => (
  <NavButton onClick={signOut}>{children}</NavButton>
))

class NavBar extends Component<NavigationProps> {
  static displayName = 'NavigationBar'

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname) {
      this.props.closeNav()
    }
  }

  render() {
    const { closeNav, token, username } = this.props
    return (
      <LockScroll>
        <TouchOutside onChange={closeNav}>
          <Nav>
            <NavColumn>
              <div>
                <User username={username} />
                <UserActionContainer>
                  <Link href="/">
                    <NavItem>All Entries</NavItem>
                  </Link>
                  <Link href="/new">
                    <NavItem>Create New Entry</NavItem>
                  </Link>
                </UserActionContainer>
              </div>

              <PostListContainer>
                <Fetch token={token}>
                  {posts =>
                    posts.length > 0 ? (
                      <SidebarPosts posts={posts} />
                    ) : (
                      <SidebarEmpty />
                    )
                  }
                </Fetch>
              </PostListContainer>

              <NavTray>
                <Link href="/legal">
                  <NavLink>Legal</NavLink>
                </Link>
                <SignOut>
                  <SignoutIcon /> <NavLabel>Sign Out</NavLabel>
                </SignOut>
              </NavTray>
            </NavColumn>
          </Nav>
        </TouchOutside>
      </LockScroll>
    )
  }
}

export default withRouter(NavBar)
