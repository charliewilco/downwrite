import * as React from "react";
import { useHistory } from "react-router-dom";
import * as Reach from "@reach/menu-button";
import { NavIcon } from "./icons";
import User from "./user";
import { AuthContext, AuthContextType } from "./auth";
import { NightModeContext, INightModeContext } from "./night-mode";

// interface IMenuEmojiProps {
//   label: string;
// }

// function MenuEmoji(props: React.PropsWithChildren<IMenuEmojiProps>) {
//   return (
//     <span role="img" aria-label={props.label}>
//       {props.children}{" "}
//     </span>
//   );
// }

export default function DropdownUI() {
  const [auth, { signOut }] = React.useContext<AuthContextType>(AuthContext);
  const darkMode = React.useContext<INightModeContext>(NightModeContext);
  const history = useHistory();

  return (
    <Reach.Menu>
      <Reach.MenuButton className="DropdownMenuButton">
        <NavIcon className="icon" />
      </Reach.MenuButton>
      <Reach.MenuList className="Sheet DropdownMenuList">
        <User border colors={["#FEB692", "#EA5455"]} name={auth.name} />
        <Reach.MenuLink onClick={() => history.push("/")} as="a">
          <span role="img" aria-label="Stack of books">
            📚{" "}
          </span>
          All Entries
        </Reach.MenuLink>
        <Reach.MenuLink onSelect={() => history.push("/new")} as="a">
          <span role="img" aria-label="Writing with a Pen">
            ✍️
          </span>
          Create New Entry
        </Reach.MenuLink>
        <Reach.MenuLink onSelect={() => history.push("/settings")} as="a">
          <span role="img" aria-label="Gear">
            ⚙️
          </span>
          Settings
        </Reach.MenuLink>
        <Reach.MenuItem onSelect={darkMode.action.onChange}>
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
        </Reach.MenuItem>
        <Reach.MenuItem onSelect={signOut}>
          <span role="img" aria-label="Fearful face">
            😨
          </span>
          Sign Out
        </Reach.MenuItem>
      </Reach.MenuList>
    </Reach.Menu>
  );
}
