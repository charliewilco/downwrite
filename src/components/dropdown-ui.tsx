import { forwardRef } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuLink, MenuList } from "@reach/menu-button";
import {
  FiLogOut,
  FiBook,
  FiEdit3,
  FiSettings,
  FiMoreHorizontal
} from "react-icons/fi";
import { Routes } from "@utils/routes";
import { UserBlock } from "./user";
import { useSubjectEffect, useDataSource } from "@hooks/index";

const NextMenuLink = forwardRef<HTMLAnchorElement, any>(({ to, ...props }, ref) => {
  return (
    <Link href={to}>
      <a ref={ref} {...props} />
    </Link>
  );
});

export function DropdownUI() {
  const store = useDataSource();
  const me = useSubjectEffect(store.me.state);

  return (
    <Menu>
      <MenuButton>
        <FiMoreHorizontal size={24} />
      </MenuButton>
      <MenuList>
        {me.username && (
          <UserBlock border colors={["#FEB692", "#EA5455"]} name={me.username} />
        )}
        <MenuLink to={Routes.DASHBOARD} as={NextMenuLink} className="menu-link">
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
      <style jsx>{`
        :global(.menu-link) {
          display: flex;
          align-items: center;
        }

        :global([data-reach-menu]) {
          display: block;
          position: absolute;
          max-width: 384px;
          font-weight: 700;
          width: 100%;
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
    </Menu>
  );
}
