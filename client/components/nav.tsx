import * as React from "react";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import styled, { keyframes } from "styled-components";
import * as Reach from "@reach/dialog";
import { AuthContext, IAuthContext } from "./auth";
import User from "./user";
import Fetch from "./collection-fetch";
import { SignoutIcon } from "./icons";

import LockScroll from "./lock-scroll";
import * as DefaultStyles from "../utils/defaultStyles";

const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (min-width: 500px) {
    justify-content: space-between;
  }
`;

export const StyledSignoutIcon = styled(SignoutIcon)`
  display: inline-block;
  vertical-align: middle;
`;

const NavButton = styled.button`
  display: block;
  color: ${props => (props.theme.night ? "white" : "#757575")};
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
    color: ${DefaultStyles.colors.blue700};
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
    color: ${DefaultStyles.colors.blue700};
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

export const NavItem = styled.a`
  display: block;
  color: ${DefaultStyles.colors.gray300};
  font-size: 16px;
  padding-top: 4px;
  padding-bottom: 4px;
  & + & {
    margin-bottom: 8px;
  }

  &:hover {
    color: ${DefaultStyles.colors.blue700};
  }
`;

export const UserActionContainer = styled.div`
  padding: 16px 8px;
`;

// TODO: Slide to close navigation?
interface NavigationProps extends WithRouterProps {
  token: string;
  closeNav: () => void;
}

export const NavLabel = styled.span`
  display: inline-block;
  vertical-align: middle;
`;

function usePrevious<T>(value: T) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const NavBar: React.FC<NavigationProps> = function(props) {
  const context = React.useContext<IAuthContext>(AuthContext);

  const prevRoute = usePrevious(props.router.route);

  React.useEffect(() => {
    if (prevRoute !== props.router.route) {
      console.log("route changed");
    }
  }, [props.router.route]);

  const onBlur = () => {
    console.log("BLUR");
    // props.closeNav();
  };

  return (
    <LockScroll>
      <Reach.Dialog>
        <Reach.DialogContent onBlur={() => onBlur()}>
          <Nav role="navigation">
            <NavColumn>
              <div>
                <User border colors={["#FEB692", "#EA5455"]} name={context.name} />
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
                <Fetch />
              </PostListContainer>

              <NavTray>
                <Link href="/legal" passHref>
                  <NavLink>Legal</NavLink>
                </Link>
                <NavButton onClick={context.signOut}>
                  <StyledSignoutIcon /> <NavLabel>Sign Out</NavLabel>
                </NavButton>
              </NavTray>
            </NavColumn>
          </Nav>
        </Reach.DialogContent>
      </Reach.Dialog>
    </LockScroll>
  );
};

export default withRouter(NavBar);
