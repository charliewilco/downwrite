import * as React from "react";
import styled, { keyframes, withTheme, createGlobalStyle } from "styled-components";
import Router from "next/router";
import * as Reach from "@reach/menu-button";
import { NavIcon, SignoutIcon } from "./icons";
import User from "./user";
import { AuthContext, IAuthContext } from "./auth";
import * as DefaultStyles from "../utils/defaultStyles";
import { NightModeContext, INightModeContext } from "./night-mode";

const StyledUser = styled(User)`
  background: ${props => props.theme.background};
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
`;

const DropdownUI: React.FC<{}> = withTheme(function(props) {
  const auth = React.useContext<IAuthContext>(AuthContext);
  const { night } = React.useContext<INightModeContext>(NightModeContext);
  return (
    <Reach.Menu>
      <Reach.MenuButton className="menu-button">
        <NavIcon className="icon" />
      </Reach.MenuButton>
      <Reach.MenuList className="menu-list">
        <StyledUser border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        <Reach.MenuLink onClick={() => Router.push("/")} component="a">
          All Entries
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => Router.push("/new")} component="a">
          Create New Entry
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => Router.push("/settings")} component="a">
          Settings
        </Reach.MenuLink>
        <Reach.MenuItem onSelect={auth.signOut}>
          <SignoutIcon className="mid" /> <span className="mid">Sign Out</span>
        </Reach.MenuItem>
      </Reach.MenuList>
      <style jsx global>{`
        :root {
          --reach-menu-button: 1;
        }

        [data-reach-menu] {
          display: block;
          position: absolute;
          width: 384px;
          font-family: ${DefaultStyles.fonts.sans};
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
          text-decoration: initial;
          padding: 5px 20px;
        }

        .menu-list {
          color: ${night ? "white" : DefaultStyles.colors.gray300};
          background: var(--cardBackground);
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
        }

        .menu-list > [data-reach-menu-item][data-selected] {
          background: var(--link);
          color: white;
          outline: none;
        }

        .menu-button {
          appearance: none;
          outline: none;
          border: 0;
          font-family: inherit;
          background: none;
          box-sizing: inherit;
        }

        .menu-list a {
          display: block;
          color: ${night ? "white" : DefaultStyles.colors.gray300};
          font-size: 16px;
          padding-top: 4px;
          padding-bottom: 4px;
        }

        .menu-list a[data-selected] {
          background: var(--link);
          color: white;
          outline: none;
        }

        .menu-list .mid {
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>
    </Reach.Menu>
  );
});

export default DropdownUI;
