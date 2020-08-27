import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Reach from "@reach/dialog";
import { AuthContext, AuthContextType } from "./auth";
import User from "./user";
import Fetch from "./collection-fetch";
import { SignoutIcon } from "./icons";
import usePrevious from "../hooks/previous";
import LockScroll from "./lock-scroll";

// TODO: Slide to close navigation?
interface INavigationProps {
  token: string;
  closeNav: () => void;
}

export default function NavBar(props: INavigationProps): JSX.Element {
  const [{ name }, { signOut }] = React.useContext<AuthContextType>(AuthContext);
  const { route } = useRouter();

  const prevRoute = usePrevious(route);

  React.useEffect(() => {
    if (prevRoute !== route) {
      onBlur();
    }
  }, [route]);

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
                <User border colors={["#FEB692", "#EA5455"]} name={name} />
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
                <button className="NavButton" onClick={signOut}>
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
