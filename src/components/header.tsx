import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./logo";
import AltAnchor from "./alt-anchor-link";
import { AuthContext, AuthContextType } from "./auth";
import DropdownUI from "./dropdown-ui";

export function UIHeader(): JSX.Element {
  const [{ authed }] = React.useContext<AuthContextType>(AuthContext);
  const router = useRouter();

  const style: React.CSSProperties = { marginRight: 16 };

  const isLogin: boolean = router ? router.route === "/login" : false;

  return !isLogin ? (
    <header className="AppHeader" data-testid="APP_HEADER">
      <nav className="AppHeaderNav">
        <Logo />
        <h1 className="AppHeaderTitle" data-testid="APP_HEADER_TITLE">
          <Link href={!authed ? "/login" : "/"}>
            <a className="AppHeaderLink">Downwrite</a>
          </Link>
        </h1>
      </nav>
      {authed ? (
        <nav className="AppHeaderNav">
          <Link href="/new">
            <AltAnchor style={style}>New</AltAnchor>
          </Link>
          <DropdownUI />
        </nav>
      ) : (
        <nav className="AppHeaderNav">
          <Link href="/login">
            <AltAnchor style={style}>Login or Sign Up</AltAnchor>
          </Link>
        </nav>
      )}
    </header>
  ) : null;
}

export default UIHeader;
