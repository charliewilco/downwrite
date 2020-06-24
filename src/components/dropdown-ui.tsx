import * as React from "react";
import { useContext } from "react";
import Link from "next/link";
import { Menu, MenuList, MenuItem, MenuButton, MenuLink } from "@reach/menu-button";
import { Routes } from "../pages/routes";
import { NavIcon } from "./icons";
import User from "./user";
import { useAuthContext } from "./auth";
import { NightModeContext, INightModeContext } from "./night-mode";

function NextMenuLink({ to, ...props }: any): JSX.Element {
  return (
    <Link passHref href={to}>
      <a {...props} />
    </Link>
  );
}

export default function DropdownUI() {
  const [auth, { signOut }] = useAuthContext();
  const darkMode = useContext<INightModeContext>(NightModeContext);

  return (
    <Menu>
      <MenuButton className="DropdownMenuButton">
        <NavIcon className="icon" />
      </MenuButton>
      <MenuList className="Sheet DropdownMenuList">
        {auth.name && (
          <User border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        )}
        <MenuLink to={Routes.INDEX} as={NextMenuLink}>
          <span role="img" aria-label="Stack of books">
            📚{" "}
          </span>
          All Entries
        </MenuLink>
        <MenuLink to={Routes.NEW} as={NextMenuLink}>
          <span role="img" aria-label="Writing with a Pen">
            ✍️
          </span>
          Create New Entry
        </MenuLink>
        <MenuLink to={Routes.SETTINGS} as={NextMenuLink}>
          <span role="img" aria-label="Gear">
            ⚙️
          </span>
          Settings
        </MenuLink>
        <MenuLink to={Routes.SLATE} as={NextMenuLink}>
          <span role="img" aria-label="Pen and Paper">
            📝
          </span>
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
