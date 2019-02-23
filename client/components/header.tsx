import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import Logo from "./logo";
import AltAnchor from "./alt-anchor-link";
import * as DefaultStyles from "../utils/defaultStyles";
import { AuthContext, IAuthContext } from "./auth";
import DropdownUI from "./dropdown-ui";

const MenuContainer = styled.nav`
  display: flex;
  align-items: center;
`;

const HomeLink = styled.a`
  margin-left: 12px;
  display: block;
  cursor: pointer;
  transition: color 375ms ease-in-out;
  color: ${props => props.theme.headerLogoLink} !important;
  &:hover {
    color: ${DefaultStyles.colors.blue700};
  }
`;

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-style: normal;
  font-family: ${DefaultStyles.fonts.sans};
  line-height: 1;
  font-weight: 700;

  @media (min-width: 57.75rem) {
    font-size: 20px;
  }
`;

const Header = styled.header`
  display: flex;
  background: ${props => props.theme.background};
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 8px;
  padding-right: 8px;

  .Navicon #NaviconGroup {
    fill: ${props => props.theme.color};
  }
`;

const UIHeader: React.FC<WithRouterProps> = ({ router }) => {
  const { authed } = React.useContext<IAuthContext>(AuthContext);

  return !(router.route === "/login") ? (
    <Header data-testid="APP_HEADER">
      <MenuContainer>
        <Logo />
        <HeaderTitle data-testid="APP_HEADER_TITLE">
          <Link href={!authed ? "/login" : "/"}>
            <HomeLink>Downwrite</HomeLink>
          </Link>
        </HeaderTitle>
      </MenuContainer>
      {authed ? (
        <MenuContainer>
          <Link prefetch href="/new">
            <AltAnchor space="right">New</AltAnchor>
          </Link>
          <DropdownUI />
        </MenuContainer>
      ) : (
        <MenuContainer>
          <Link prefetch href="/login">
            <AltAnchor space="right">Login or Sign Up</AltAnchor>
          </Link>
        </MenuContainer>
      )}
    </Header>
  ) : null;
};

export default withRouter(UIHeader);
