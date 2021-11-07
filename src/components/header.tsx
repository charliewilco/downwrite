import Link from "next/link";
import Logo from "./logo";
import DropdownUI from "./dropdown-ui";
import { Routes } from "@utils/routes";
import { useStore } from "@store/provider";

export function UIHeader(): JSX.Element {
  const store = useStore();

  const homeLink: string = store.authed ? Routes.DASHBOARD : Routes.LOGIN;

  return (
    <header
      className="flex items-center justify-between px-2 py-4"
      data-testid="APP_HEADER">
      <nav className="flex items-center">
        <Logo />
        <h1
          className="text-base xl:text-xl font-sans leading-none font-bold"
          data-testid="APP_HEADER_TITLE">
          <Link href={homeLink} passHref>
            <a className="ml-3 uppercase text-sm tracking-widest block cursor-pointer">
              Downwrite
            </a>
          </Link>
        </h1>
      </nav>
      {store.authed ? (
        <nav className="flex items-center">
          <Link href={Routes.NEW} passHref>
            <a
              data-testid="CREATE_NEW_ENTRY_BUTTON"
              className="text-white leading-none cursor-pointer opacity-50 text-sm mr-8">
              New
            </a>
          </Link>
          <DropdownUI />
        </nav>
      ) : (
        <nav className="flex items-center">
          <Link href={Routes.LOGIN} passHref>
            <a className="text-white leading-none cursor-pointer opacity-50 text-sm mr-8">
              Login or Sign Up
            </a>
          </Link>
        </nav>
      )}
    </header>
  );
}
