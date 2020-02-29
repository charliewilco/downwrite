import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./logo";
import { AuthContext, AuthContextType } from "./auth";
import DropdownUI from "./dropdown-ui";
import { Routes } from "../pages/routes";

export function UIHeader(): JSX.Element {
  const [{ authed }] = React.useContext<AuthContextType>(AuthContext);
  const router = useLocation();

  const style: React.CSSProperties = { marginRight: 16 };

  const isLogin: boolean = router ? router.pathname === "/login" : false;
  const homeLink: string = !authed ? Routes.LOGIN : Routes.INDEX;

  return !isLogin ? (
    <header className="AppHeader" data-testid="APP_HEADER">
      <nav className="AppHeaderNav">
        <Logo />
        <h1 className="AppHeaderTitle" data-testid="APP_HEADER_TITLE">
          <Link to={homeLink} className="AppHeaderLink">
            Downwrite
          </Link>
        </h1>
      </nav>
      {authed ? (
        <nav className="AppHeaderNav">
          <Link to={Routes.NEW} className="AltLink" style={style}>
            New
          </Link>
          <DropdownUI />
        </nav>
      ) : (
        <nav className="AppHeaderNav">
          <Link to={Routes.LOGIN} className="AltLink" style={style}>
            Login or Sign Up
          </Link>
        </nav>
      )}
    </header>
  ) : null;
}

export default UIHeader;
