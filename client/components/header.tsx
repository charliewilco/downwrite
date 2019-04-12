import * as React from "react";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import Logo from "./logo";
import AltAnchor from "./alt-anchor-link";
import * as DefaultStyles from "../utils/defaultStyles";
import { AuthContext, IAuthContext } from "./auth";
import DropdownUI from "./dropdown-ui";

export function UIHeader(props: WithRouterProps): JSX.Element {
  const context = React.useContext<IAuthContext>(AuthContext);

  return (
    <>
      {!(props.router.route === "/login") ? (
        <header className="ui-header" data-testid="APP_HEADER">
          <nav className="nav">
            <Logo />
            <h1 data-testid="APP_HEADER_TITLE">
              <Link href={!context.authed ? "/login" : "/"}>
                <a className="home-link">Downwrite</a>
              </Link>
            </h1>
          </nav>
          {context.authed ? (
            <nav className="nav">
              <Link prefetch href="/new">
                <AltAnchor style={{ marginRight: 8 }}>New</AltAnchor>
              </Link>
              <DropdownUI />
            </nav>
          ) : (
            <nav className="nav">
              <Link prefetch href="/login">
                <AltAnchor style={{ marginRight: 8 }}>Login or Sign Up</AltAnchor>
              </Link>
            </nav>
          )}
          <style jsx>{`
            .ui-header {
              display: flex;
              background: var(--background);
              align-items: center;
              justify-content: space-between;
              padding-top: 16px;
              padding-bottom: 16px;
              padding-left: 8px;
              padding-right: 8px;
            }

            h1 {
              font-size: 16px;
              font-style: normal;
              font-family: ${DefaultStyles.Fonts.sans};
              line-height: 1;
              font-weight: 700;
            }

            .home-link {
              margin-left: 12px;
              display: block;
              cursor: pointer;
              transition: color 375ms ease-in-out;
              color: var(--headerLogoLink) !important;
            }

            .home-link:hover {
              color: ${DefaultStyles.colors.blue700};
            }

            .nav {
              display: flex;
              align-items: center;
            }
            @media (min-width: 57.75rem) {
              h1 {
                font-size: 20px;
              }
            }
          `}</style>
        </header>
      ) : null}
    </>
  );
}

export default withRouter(UIHeader);
