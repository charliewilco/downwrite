import * as React from "react";
import Router from "next/router";
import * as Reach from "@reach/menu-button";
import { NavIcon } from "./icons";
import User from "./user";
import { AuthContext, IAuthContext } from "./auth";
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
  const auth = React.useContext<IAuthContext>(AuthContext);
  const darkMode = React.useContext<INightModeContext>(NightModeContext);

  return (
    <Reach.Menu>
      <Reach.MenuButton className="DropdownMenuButton">
        <NavIcon className="icon" />
      </Reach.MenuButton>
      <Reach.MenuList className="Sheet DropdownMenuList">
        <User border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        <Reach.MenuLink onClick={() => Router.push("/")} component="a">
          <MenuEmoji label="Stack of books">📚</MenuEmoji>
          All Entries
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => Router.push("/new")} component="a">
          <MenuEmoji label="Writing with a Pen">✍️</MenuEmoji>
          Create New Entry
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => Router.push("/settings")} component="a">
          <MenuEmoji label="Gear">⚙️</MenuEmoji>
          Settings
        </Reach.MenuLink>
        <Reach.MenuItem onSelect={darkMode.action.onChange}>
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
        </Reach.MenuItem>
        <Reach.MenuItem onSelect={auth.signOut}>
          <MenuEmoji label="Fearful face">😨</MenuEmoji>
          Sign Out
        </Reach.MenuItem>
      </Reach.MenuList>
    </Reach.Menu>
  );
}
