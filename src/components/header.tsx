import Link from "next/link";
import Logo from "./logo";
import DropdownUI from "./dropdown-ui";
import { Routes } from "@utils/routes";
import { useDataSource } from "@store/provider";
import { useSubjectEffect } from "@hooks/useSubject";

export const _UIHeader: React.VFC = () => {
  const store = useDataSource();
  const me = useSubjectEffect(store.me.state);

  const link = me.authed ? Routes.DASHBOARD : Routes.LOGIN;

  return (
    <header data-testid="APP_HEADER">
      <nav>
        <Logo />
        <h1 data-testid="APP_HEADER_TITLE">
          <Link href={link} passHref>
            <a className="logo-link">Downwrite</a>
          </Link>
        </h1>
      </nav>
      {me.authed ? (
        <nav>
          <Link href={Routes.NEW} passHref>
            <a data-testid="CREATE_NEW_ENTRY_BUTTON" className="new-link">
              New
            </a>
          </Link>
          <DropdownUI />
        </nav>
      ) : (
        <nav>
          <Link href={Routes.LOGIN} passHref>
            <a className="login-link">Login or Sign Up</a>
          </Link>
        </nav>
      )}
      <style jsx>{`
        header,
        nav {
          display: flex;
          align-items: center;
        }
        header {
          justify-content: space-between;
          padding: 1rem 0.5rem;
          width: 100%;
        }

        h1 {
        }

        .logo-link {
          margin-left: 1rem;
          text-transform: uppercase;
          display: block;
          cursor: pointer;
          font-size: 0.875rem;
          line-height: 1;
          letter-spacing: 0.1em;
          text-decoration: none;
        }

        .login-link {
          opacity: 50%;
        }

        .login-link,
        .new-link {
          margin-right: 1rem;
        }
      `}</style>
    </header>
  );
};

export const UIHeader = _UIHeader;
