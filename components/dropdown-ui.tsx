import * as React from "react";
import { useRouter } from "next/router";
import * as Reach from "@reach/menu-button";
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
  const router = useRouter();

  return (
    <Reach.Menu>
      <Reach.MenuButton className="DropdownMenuButton">
        <NavIcon className="icon" />
      </Reach.MenuButton>
      <Reach.MenuList className="Sheet DropdownMenuList">
        <User border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        <Reach.MenuLink onClick={() => router.push("/")} component="a">
          <MenuEmoji label="Stack of books">📚</MenuEmoji>
          All Entries
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => router.push("/new")} component="a">
          <MenuEmoji label="Writing with a Pen">✍️</MenuEmoji>
          Create New Entry
        </Reach.MenuLink>
        <Reach.MenuLink onClick={() => router.push("/settings")} component="a">
          <MenuEmoji label="Gear">⚙️</MenuEmoji>
          Settings
        </Reach.MenuLink>
        <Reach.MenuItem onSelect={darkMode.action.onChange}>
          {darkMode.night ? (
            <React.Fragment>
              <MenuEmoji label="Sun smiling">🌞</MenuEmoji>
              Switch to Light Mode
            </React.Fragment>
          ) : (
            <React.Fragment>
              <MenuEmoji label="Moon">🌙</MenuEmoji>
              Switch to Dark Mode
            </React.Fragment>
          )}
        </Reach.MenuItem>
        <Reach.MenuItem onSelect={signOut}>
          <MenuEmoji label="Fearful face">😨</MenuEmoji>
          Sign Out
        </Reach.MenuItem>
      </Reach.MenuList>
    </Reach.Menu>
  );
}
