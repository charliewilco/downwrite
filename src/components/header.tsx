import Link from "next/link";
import { useRouter } from "next/router";
import VisuallyHidden from "@reach/visually-hidden";
import Logo from "./logo";
import DropdownUI from "./dropdown-ui";
import { Routes } from "../utils/routes";
import { useCurrentUser } from "../atoms";

export function UIHeader(): JSX.Element {
  const [currentUser] = useCurrentUser();
  const router = useRouter();

  const authed = currentUser && currentUser.id && currentUser.username;

  const isLogin: boolean = router ? router.pathname === "/login" : false;
  const homeLink: string = !!authed ? Routes.DASHBOARD : Routes.LOGIN;

  console.log(authed, homeLink);

  return !isLogin ? (
    <header
      className="flex items-center justify-between px-2 py-4"
      data-testid="APP_HEADER">
      <nav className="flex items-center">
        <Logo />
        <h1
          className="text-base xl:text-xl font-sans leading-none font-bold"
          data-testid="APP_HEADER_TITLE">
          <Link href={homeLink} passHref>
            <a className="ml-3 block cursor-pointer">Downwrite</a>
          </Link>
        </h1>
      </nav>
      {authed ? (
        <nav className="flex items-center">
          <Link href={Routes.NEW} passHref>
            <a className="AltLink mr-8">New</a>
          </Link>
          <DropdownUI />
        </nav>
      ) : (
        <nav className="flex items-center">
          <Link href={Routes.LOGIN} passHref>
            <a className="AltLink mr-8">Login or Sign Up</a>
          </Link>
        </nav>
      )}
    </header>
  ) : (
    <VisuallyHidden />
  );
}

export default UIHeader;
