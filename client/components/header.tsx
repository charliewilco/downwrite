import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import Logo from "./logo";
import { NavIcon } from "./icons";
import { colors, fonts } from "../utils/defaultStyles";
import { withAuth } from "./auth";

const MenuContainer = styled.nav`
  display: flex;
  align-items: center;
`;

const NewButton = styled.a`
  font-size: 14px;
  cursor: pointer;
  line-height: 1.1;
  opacity: 0.5;
  color: ${props => props.theme.color} !important;
  margin-right: 32px;

  &:hover,
  &:focus {
    color: ${colors.text};
    opacity: 1;
  }
`;

const HomeButton = styled.a`
  margin-left: 12px;
  display: block;
  cursor: pointer;
  transition: color 375ms ease-in-out;
  color: ${props => props.theme.headerLogoLink} !important;
  &:hover {
    color: ${colors.blue700};
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

const LoginSignUp = () => (
  <MenuContainer>
    <Link prefetch href="/login">
      <NewButton>Login or Sign Up</NewButton>
    </Link>
  </MenuContainer>
);

const Menu = ({ toggleNav }) => (
  <MenuContainer>
    <Link prefetch href="/new" as="/new">
      <NewButton>New</NewButton>
    </Link>
    <ToggleButton onClick={toggleNav}>
      <NavIcon className="Navicon" />
    </ToggleButton>
  </MenuContainer>
);

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-style: normal;
  font-family: ${fonts.sans};
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
  name: string;
  onClick: Function;
  route: string;
  open: boolean;
}

class UIHeader extends React.Component<IHeaderProps, void> {
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
              <HomeButton>Downwrite</HomeButton>
            </Link>
          </HeaderTitle>
        </MenuContainer>
        {authed ? <Menu toggleNav={onClick} /> : <LoginSignUp />}
      </Header>
    ) : null;
  }
}

export default withAuth(UIHeader);
