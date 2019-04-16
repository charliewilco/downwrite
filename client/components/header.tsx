import * as React from "react";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import Logo from "./logo";
import AltAnchor from "./alt-anchor-link";
import { AuthContext, IAuthContext } from "./auth";
import DropdownUI from "./dropdown-ui";

export function UIHeader(props: WithRouterProps): JSX.Element {
  const { authed } = React.useContext<IAuthContext>(AuthContext);
  const style: React.CSSProperties = { marginRight: 16 };
  const isLogin: boolean = props.router.route === "/login";

  return (
    <>
      {!isLogin ? (
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
              <Link prefetch href="/new">
                <AltAnchor style={style}>New</AltAnchor>
              </Link>
              <DropdownUI />
            </nav>
          ) : (
            <nav className="AppHeaderNav">
              <Link prefetch href="/login">
                <AltAnchor style={style}>Login or Sign Up</AltAnchor>
              </Link>
            </nav>
          )}
        </header>
      ) : null}
    </>
  );
}

export default withRouter(UIHeader);
