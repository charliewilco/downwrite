import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, MenuList, MenuItem, MenuButton, MenuLink } from "@reach/menu-button";
import { Routes } from "../pages/routes";
import { NavIcon } from "./icons";
import User from "./user";
import { AuthContext, AuthContextType } from "./auth";
import { NightModeContext, INightModeContext } from "./night-mode";

export default function DropdownUI() {
  const [auth, { signOut }] = React.useContext<AuthContextType>(AuthContext);
  const darkMode = React.useContext<INightModeContext>(NightModeContext);

  return (
    <Menu>
      <MenuButton className="DropdownMenuButton">
        <NavIcon className="icon" />
      </MenuButton>
      <MenuList className="Sheet DropdownMenuList">
        <User border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        <MenuLink to={Routes.INDEX} as={Link}>
          <span role="img" aria-label="Stack of books">
            📚{" "}
          </span>
          All Entries
        </MenuLink>
        <MenuLink to={Routes.NEW} as={Link}>
          <span role="img" aria-label="Writing with a Pen">
            ✍️
          </span>
          Create New Entry
        </MenuLink>
        <MenuLink to={Routes.SETTINGS} as={Link}>
          <span role="img" aria-label="Gear">
            ⚙️
          </span>
          Settings
        </MenuLink>
        <MenuLink to={Routes.SLATE} as={Link}>
          Slate Editor
        </MenuLink>
        <MenuItem onSelect={darkMode.action.onChange}>
          {darkMode.night ? (
            <React.Fragment>
              <span role="img" aria-label="Sun smiling">
                🌞
              </span>
              Switch to Light Mode
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span role="img" aria-label="Moon">
                🌙
              </span>
              Switch to Dark Mode
            </React.Fragment>
          )}
        </MenuItem>
        <MenuItem onSelect={signOut}>
          <span role="img" aria-label="Fearful face">
            😨
          </span>
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
