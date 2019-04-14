import * as React from "react";
import Router from "next/router";
import * as Reach from "@reach/menu-button";
import { NavIcon, SignoutIcon } from "./icons";
import User from "./user";
import { AuthContext, IAuthContext } from "./auth";

export default function DropdownUI() {
  const auth = React.useContext<IAuthContext>(AuthContext);
  return (
    <Reach.Menu>
      <Reach.MenuButton className="DropdownMenuButton">
        <NavIcon className="icon" />
      </Reach.MenuButton>
      <Reach.MenuList className="DropdownMenuList">
        <User border colors={["#FEB692", "#EA5455"]} name={auth.name} />
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
    </Reach.Menu>
  );
}
