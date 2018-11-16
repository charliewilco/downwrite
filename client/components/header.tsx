import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import Logo from "./logo";
import AltAnchor from "./alt-anchor-link";
import { NavIcon } from "./icons";
import * as DefaultStyles from "../utils/defaultStyles";
import { withAuth } from "./auth";

const MenuContainer = styled.nav`
  display: flex;
  align-items: center;
`;

const HomeLink = styled.a`
  margin-left: 12px;
  display: block;
  cursor: pointer;
  transition: color 375ms ease-in-out;
  font-weight: 700;
  color: ${props => props.theme.headerLogoLink} !important;
  &:hover {
    color: ${DefaultStyles.colors.blue700};
  }
`;

const ToggleButton = styled.button`
  appearance: none;
  outline: none;
  border: 0;
  font-family: inherit;
  background: none;
  box-sizing: inherit;
`;

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-style: normal;
  font-family: ${DefaultStyles.fonts.sans};
  line-height: 1;
  font-weight: 400;

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

interface IHeaderProps {
  authed: boolean;
  onClick: () => void;
  route: string;
}

class UIHeader extends React.Component<IHeaderProps, {}> {
  render() {
    const { authed, onClick, route } = this.props;

    const url = !authed
      ? {
          href: "/login",
          as: "/"
        }
      : {
          href: "/",
          as: "/"
        };

    return !(route === "/login") ? (
      <Header data-testid="APP_HEADER">
        <MenuContainer>
          <Logo />
          <HeaderTitle data-testid="APP_HEADER_TITLE">
            <Link {...url}>
              <HomeLink>Downwrite</HomeLink>
            </Link>
          </HeaderTitle>
        </MenuContainer>
        {authed ? (
          <MenuContainer>
            <Link prefetch href="/new" as="/new">
              <AltAnchor space="right">New</AltAnchor>
            </Link>
            <ToggleButton onClick={onClick}>
              <NavIcon className="Navicon" />
            </ToggleButton>
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
  }
}

export default withAuth(UIHeader);
