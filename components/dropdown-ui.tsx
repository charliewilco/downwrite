import * as React from "react";
import Router from "next/router";
import { Menu, MenuButton, MenuLink, MenuItem, MenuList } from "@reach/menu-button";
import { NavIcon } from "./icons";
import User from "./user";
import { AuthContext, AuthContextType } from "./auth";
import { NightModeContext, INightModeContext } from "./night-mode";

interface IMenuEmojiProps {
  label: string;
  children: React.ReactNode;
}

function MenuEmoji(props: IMenuEmojiProps) {
  return (
    <span role="img" aria-label={props.label}>
      {props.children}{" "}
    </span>
  );
}

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
        <MenuLink onClick={() => Router.push("/")} as="a">
          <MenuEmoji label="Stack of books">📚</MenuEmoji>
          All Entries
        </MenuLink>
        <MenuLink onClick={() => Router.push("/new")} as="a">
          <MenuEmoji label="Writing with a Pen">✍️</MenuEmoji>
          Create New Entry
        </MenuLink>
        <MenuLink onClick={() => Router.push("/settings")} as="a">
          <MenuEmoji label="Gear">⚙️</MenuEmoji>
          Settings
        </MenuLink>
        <MenuItem onSelect={darkMode.action.onChange}>
          {darkMode.night ? (
            <>
              <MenuEmoji label="Sun smiling">🌞</MenuEmoji>
              Switch to Light Mode
            </>
          ) : (
            <>
              <MenuEmoji label="Moon">🌙</MenuEmoji>
              Switch to Dark Mode
            </>
          )}
        </MenuItem>
        <MenuItem onSelect={signOut}>
          <MenuEmoji label="Fearful face">😨</MenuEmoji>
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
