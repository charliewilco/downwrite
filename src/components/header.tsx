import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./logo";
import { useAuthContext } from "./auth";
import DropdownUI from "./dropdown-ui";
import { Routes } from "../pages/routes";

export function UIHeader(): JSX.Element {
  const [{ authed }] = useAuthContext();
  const router = useRouter();

  const style: React.CSSProperties = { marginRight: 16 };

  const isLogin: boolean = router ? router.pathname === "/login" : false;
  const homeLink: string = !authed ? Routes.LOGIN : Routes.INDEX;

  return !isLogin ? (
    <header className="AppHeader" data-testid="APP_HEADER">
      <nav className="AppHeaderNav">
        <Logo />
        <h1 className="AppHeaderTitle" data-testid="APP_HEADER_TITLE">
          <Link href={homeLink} passHref>
            <a className="AppHeaderLink">Downwrite</a>
          </Link>
        </h1>
      </nav>
      {authed ? (
        <nav className="AppHeaderNav">
          <Link href={Routes.NEW} passHref>
            <a className="AltLink" style={style}>
              New
            </a>
          </Link>
          <DropdownUI />
        </nav>
      ) : (
        <nav className="AppHeaderNav">
          <Link href={Routes.LOGIN} passHref>
            <a className="AltLink" style={style}>
              Login or Sign Up
            </a>
          </Link>
        </nav>
      )}
    </header>
  ) : (
    <Fragment />
  );
}

export default UIHeader;
