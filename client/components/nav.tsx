import * as React from "react";
import Link from "next/link";
import { withRouter, WithRouterProps } from "next/router";
import * as Reach from "@reach/dialog";
import { AuthContext, IAuthContext } from "./auth";
import User from "./user";
import Fetch from "./collection-fetch";
import { SignoutIcon } from "./icons";

import LockScroll from "./lock-scroll";

// TODO: Slide to close navigation?
interface INavigationProps extends WithRouterProps {
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

function NavBar(props: INavigationProps): JSX.Element {
  const context = React.useContext<IAuthContext>(AuthContext);

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
    </LockScroll>
  );
}

export default withRouter(NavBar);
