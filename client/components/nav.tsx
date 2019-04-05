import * as React from "react";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import * as Reach from "@reach/dialog";
import { AuthContext, IAuthContext } from "./auth";
import User from "./user";
import Fetch from "./collection-fetch";
import { SignoutIcon } from "./icons";

import LockScroll from "./lock-scroll";
import * as DefaultStyles from "../utils/defaultStyles";
import { NightModeContext, INightModeContext } from "./night-mode";

// TODO: Slide to close navigation?
interface NavigationProps extends WithRouterProps {
  token: string;
  closeNav: () => void;
}

function usePrevious<T>(value: T) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const NavBar: React.FC<NavigationProps> = function(props) {
  const context = React.useContext<IAuthContext>(AuthContext);
  const theme = React.useContext<INightModeContext>(NightModeContext);

  const prevRoute = usePrevious(props.router.route);

  React.useEffect(() => {
    if (prevRoute !== props.router.route) {
      onBlur();
    }
  }, [props.router.route]);

  const onBlur = () => {
    // props.closeNav();
  };

  return (
    <LockScroll>
      <Reach.Dialog>
        <Reach.DialogContent onBlur={() => onBlur()}>
          <nav className="Nav" role="navigation">
            <div className="NavColumn">
              <div>
                <User border colors={["#FEB692", "#EA5455"]} name={context.name} />
                <div className="UserActionContainer">
                  <Link href="/" passHref>
                    <a className="NavItem">All Entries</a>
                  </Link>
                  <Link href="/new" prefetch passHref>
                    <a className="NavItem">Create New Entry</a>
                  </Link>
                </div>
              </div>

              <div className="PostListContainer">
                <Fetch />
              </div>

              <footer className="NavTray">
                <Link href="/legal" passHref>
                  <a className="NavLink">Legal</a>
                </Link>
                <button className="NavButton" onClick={context.signOut}>
                  <SignoutIcon
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                  <span className="NavLabel">Sign Out</span>
                </button>
              </footer>
            </div>
          </nav>
        </Reach.DialogContent>
      </Reach.Dialog>
      <style jsx>{`
        @keyframes FADE_IN_FROM_LEFT_NAV {
          0% {
            transform: translate(25%, 0);
            opacity: 0;
          }

          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }

        .NavLabel {
          vertical-align: middle;
          display: inline-block;
        }

        .Nav {
          display: flex;
          animation: FADE_IN_FROM_LEFT_NAV 0.45s;
          width: 75%;
          box-shadow: var(--shadow);
          background: var(--background);
          position: fixed;
          z-index: 100;
          right: 0;
          bottom: 0;
          top: 0;
        }
        .NavItem {
          display: block;
          color: ${DefaultStyles.colors.gray300};
          font-size: 16px;
          padding-top: 4px;
          padding-bottom: 4px;
        }
        .NavItem + .NavItem {
          margin-bottom: 8px;
        }

        .NavItem:hover {
          color: ${DefaultStyles.colors.blue700};
        }
        .PostListContainer {
          padding: 8px;
        }

        .UserActionContainer {
          padding: 16px 8px;
        }

        .NavColumn {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .NavButton {
          display: block;
          color: ${theme.night ? "white" : "#757575"};
          font-size: 12px;
          border: 0;
          appearance: none;
          font-family: inherit;
          box-sizing: inherit;
          background: inherit;
        }
        .NavButton + .NavButton {
          margin-bottom: 8px;
        }
        .NavButton:hover {
          color: ${DefaultStyles.colors.blue700};
        }
        .NavLink {
          display: block;
          color: #757575;
          font-size: 12px;
        }
        .NavLink + .NavLink {
          margin-bottom: 8px;
        }

        .NavLink:hover {
          color: ${DefaultStyles.colors.blue700};
        }

        .NavTray {
          border-top: 1px solid var(--border);
          text-align: right;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (min-width: 500px) {
          .NavColumn {
            justify-content: space-between;
          }

          .Nav {
            width: 384px;
          }

          .PostListContainer {
            flex: 1;
          }
        }
      `}</style>
    </LockScroll>
  );
};

export default withRouter(NavBar);
