import * as React from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import Router from "next/router";
import * as Reach from "@reach/menu-button";
import { NavIcon, SignoutIcon } from "./icons";
import { NavItem } from "./nav";
import User from "./user";
import { AuthContext, IAuthContext } from "./auth";
import * as DefaultStyle from "../utils/defaultStyles";

const MenuStyles = createGlobalStyle`
  :root {
    --reach-menu-button: 1;
  }

  [data-reach-menu] {
    display: block;
    position: absolute;
    width: 384px;
    font-family: ${DefaultStyle.fonts.sans};
  }

  [data-reach-menu-list] {
    display: block;
    white-space: nowrap;
    outline: none;
    padding: 0;
  }

  [data-reach-menu-item] {
    display: block;
  }

  [data-reach-menu-item] {
    cursor: pointer;
    display: block;
    color: inherit;
    font: inherit;
    color: white;
    text-decoration: initial;
    padding: 5px 20px;
  }
`;

const StyledUser = styled(User)`
  background: ${props => props.theme.background};
`;

const ToggleButton = styled(Reach.MenuButton)`
  appearance: none;
  outline: none;
  border: 0;
  font-family: inherit;
  background: none;
  box-sizing: inherit;
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

export const MenuList = styled(Reach.MenuList)`
  animation: ${fadeInFromLeft} 0.45s;
  color: ${props => props.theme.color};
  background: ${props => props.theme.cardBackground};
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);

  & > [data-reach-menu-item][data-selected] {
    background: ${props => props.theme.link};
    outline: none;
  }
`;

export const MenuLabel = styled.span`
  display: inline-block;
  vertical-align: middle;
`;

export const StyledSignoutIcon = styled(SignoutIcon)`
  display: inline-block;
  vertical-align: middle;
`;

const DropdownUI: React.FC<{}> = function(props) {
  const auth = React.useContext<IAuthContext>(AuthContext);
  return (
    <Reach.Menu>
      <MenuStyles />
      <ToggleButton>
        <NavIcon className="Navicon" />
      </ToggleButton>
      <MenuList>
        <StyledUser border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        <Reach.MenuLink onClick={() => Router.push("/")} component={NavItem}>
          All Entries
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => Router.push("/new")} component={NavItem}>
          Create New Entry
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => Router.push("/settings")} component={NavItem}>
          Settings
        </Reach.MenuLink>
        <Reach.MenuItem onSelect={auth.signOut}>
          <StyledSignoutIcon /> <MenuLabel>Sign Out</MenuLabel>
        </Reach.MenuItem>
      </MenuList>
    </Reach.Menu>
  );
};

export default DropdownUI;
