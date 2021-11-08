import Link from "next/link";
import { forwardRef } from "react";
import { Menu, MenuButton, MenuLink, MenuList } from "@reach/menu-button";
import {
  FiPlus,
  FiLogOut,
  FiBook,
  FiEdit3,
  FiSettings,
  FiMoreHorizontal
} from "react-icons/fi";
import { Logo } from "@components/logo";
import { UserBlock } from "@components/user-blocks";

import { useDataSource, useSubjectEffect } from "@hooks/index";
import { Routes } from "@utils/routes";

const NextMenuLink = forwardRef<HTMLAnchorElement, any>(({ to, ...props }, ref) => {
  return (
    <Link href={to}>
      <a ref={ref} {...props} />
    </Link>
  );
});

NextMenuLink.displayName = "NextMenuLink";

export const UIHeader: React.VFC = () => {
  const store = useDataSource();
  const me = useSubjectEffect(store.me.state);

  return (
    <header data-testid="APP_HEADER">
      <nav>
        <h1 data-testid="APP_HEADER_TITLE">
          <Link href={me.authed ? Routes.DASHBOARD : Routes.LOGIN} passHref>
            <a className="logo-link">
              <Logo />
            </a>
          </Link>
        </h1>
      </nav>
      {me.authed ? (
        <nav>
          <Link href={Routes.NEW} passHref>
            <a data-testid="CREATE_NEW_ENTRY_BUTTON" className="new-link">
              <FiPlus size={24} />
            </a>
          </Link>
          <Menu>
            <MenuButton>
              <FiMoreHorizontal size={24} />
            </MenuButton>
            <MenuList>
              {me.username && (
                <UserBlock
                  border
                  colors={["#FEB692", "#EA5455"]}
                  name={me.username}
                />
              )}
              <MenuLink
                to={Routes.DASHBOARD}
                as={NextMenuLink}
                className="menu-link">
                <span role="img" aria-label="Stack of books">
                  <FiBook size={16} />
                </span>
                All Entries
              </MenuLink>
              <MenuLink to={Routes.NEW} as={NextMenuLink} className="menu-link">
                <span role="img" aria-label="Writing with a Pen">
                  <FiEdit3 size={16} />
                </span>
                Create New Entry
              </MenuLink>
              <MenuLink to={Routes.SETTINGS} as={NextMenuLink} className="menu-link">
                <span role="img" aria-label="Gear">
                  <FiSettings size={16} />
                </span>
                Settings
              </MenuLink>

              <MenuLink to={Routes.SIGN_OUT} as={NextMenuLink} className="menu-link">
                <span role="img" aria-label="Fearful face">
                  <FiLogOut size={16} />
                </span>
                Sign Out
              </MenuLink>
            </MenuList>
          </Menu>
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
          flex: 0;
          justify-content: space-between;
          padding: 1rem 0.5rem;
          width: 100%;
          border-bottom: 1px solid var(--onyx-700);
        }

        .logo-link {
          text-transform: uppercase;
          display: block;
          cursor: pointer;
          font-size: 0.875rem;
          line-height: 1;
          letter-spacing: 0.1em;
          text-decoration: none;
          width: 2rem;
          height: 2rem;
        }

        a {
          color: var(--pixieblue-500);
        }

        .login-link {
          opacity: 50%;
        }

        .login-link,
        .new-link {
          margin-right: 1rem;
        }

        .new-link {
          margin-left: 1rem;
        }

        nav {
          position: relative;
        }

        :global(.menu-link) {
          display: flex;
          align-items: center;
        }

        :global([data-reach-menu]) {
          display: block;
          position: absolute;
          font-weight: 700;
          width: 100%;
        }

        :global([data-reach-menu-popover]) {
          width: 384px;
        }

        :global([data-reach-menu-list]) {
          display: block;
          white-space: nowrap;
          outline: none;
          padding: 0;
          background: var(--surface);
          width: 100%;
        }

        :global([data-reach-menu-button]) {
          appearance: none;
          border: 0;
          background: none;
          color: inherit;
        }

        :global([data-reach-menu-item]) {
        }

        :global([data-reach-menu-item]) {
          cursor: pointer;
          color: inherit;
          font: inherit;
          text-decoration: initial;
          padding: 8px;
        }

        span[role="img"] {
          margin-right: 0.5rem;
        }
      `}</style>
    </header>
  );
};
