import * as React from 'react';
import Link from 'next/link';
import { withRouter, SingletonRouter } from 'next/router';
import styled, { keyframes } from 'styled-components';
import { withAuth } from './auth';
import User from './user';
import Fetch from './collection-fetch';
import { SignoutIcon } from './icons';
import { SidebarEmpty } from './empty-posts';
import SidebarPosts from './sidebar-posts';
import TouchOutside from './touch-outside';
import LockScroll from './lock-scroll';
import { colors } from '../utils/defaultStyles';

const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (min-width: 500px) {
    justify-content: space-between;
  }
`;

const StyledSignoutIcon = styled(SignoutIcon)`
  display: inline-block;
  vertical-align: middle;
`;

const NavButton = styled.button`
  display: block;
  color: ${props => (props.theme.night ? 'white' : '#757575')};
  font-size: 12px;
  border: 0;
  appearance: none;
  font-family: inherit;
  box-sizing: inherit;
  background: inherit;
  & + & {
    margin-bottom: 8px;
  }

  &:hover {
    color: ${colors.blue700};
  }
`;

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
`;

const PostListContainer = styled.div`
  padding: 8px;

  @media (min-width: 500px) {
    flex: 1;
  }
`;

const fadeInFromLeft = keyframes`
  0% {
    transform: translate(25%, 0);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
`;

const Nav = styled.nav`
  display: flex;
  animation: ${fadeInFromLeft} 0.45s;
  width: 75%;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background: ${props => props.theme.background};
  position: fixed;
  z-index: 100;
  right: 0;
  bottom: 0;
  top: 0;

  @media (min-height: 500px) {
    width: 384px;
  }
`;

const NavTray = styled.footer`
  border-top: 1px solid ${props => props.theme.border};
  text-align: right;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

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
`;

const UserActionContainer = styled.div`
  padding: 16px 8px;
`;

// TODO: Slide to close navigation?
interface NavigationProps {
  token: string;
  username: string;
  pathname: string;
  closeNav: () => void;
  router: SingletonRouter;
}

const NavLabel = styled.span`
  display: inline-block;
  vertical-align: middle;
`;

const SignOut = withAuth(({ signOut, children }) => (
  <NavButton onClick={signOut}>{children}</NavButton>
));

const AuthedFetch = withAuth(Fetch);
const AuthedUserBlock = withAuth(User);

class NavBar extends React.Component<NavigationProps, any> {
  static displayName = 'NavigationBar';

  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname) {
      this.props.closeNav();
    }
  }

  render() {
    const { closeNav } = this.props;
    return (
      <LockScroll>
        <TouchOutside onChange={closeNav}>
          <Nav>
            <NavColumn>
              <div>
                <AuthedUserBlock border />
                <UserActionContainer>
                  <Link href="/" passHref>
                    <NavItem>All Entries</NavItem>
                  </Link>
                  <Link href="/new" prefetch passHref>
                    <NavItem>Create New Entry</NavItem>
                  </Link>
                </UserActionContainer>
              </div>

              <PostListContainer>
                <AuthedFetch>
                  {({ posts }) =>
                    posts.length > 0 ? (
                      <SidebarPosts posts={posts} />
                    ) : (
                      <SidebarEmpty />
                    )
                  }
                </AuthedFetch>
              </PostListContainer>

              <NavTray>
                <Link href="/legal" passHref>
                  <NavLink>Legal</NavLink>
                </Link>
                <SignOut>
                  <StyledSignoutIcon /> <NavLabel>Sign Out</NavLabel>
                </SignOut>
              </NavTray>
            </NavColumn>
          </Nav>
        </TouchOutside>
      </LockScroll>
    );
  }
}

export default withRouter(NavBar);
