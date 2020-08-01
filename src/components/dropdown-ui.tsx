import { forwardRef } from "react";
import Link from "next/link";
import { Menu, MenuList, MenuItem, MenuButton, MenuLink } from "@reach/menu-button";
import {
  FiLogOut,
  FiBook,
  FiEdit3,
  FiSettings,
  FiSun,
  FiMoon,
  FiMenu
} from "react-icons/fi";
import { Routes } from "@utils/routes";
import User from "./user";
import { useSettings, useCurrentUser } from "@reducers/app";

const NextMenuLink = forwardRef<HTMLAnchorElement, any>(({ to, ...props }, ref) => {
  return (
    <Link href={to}>
      <a ref={ref} {...props} />
    </Link>
  );
});

export function DropdownDarkMode() {
  const [settings, { toggleDarkMode }] = useSettings();
  return (
    <MenuItem onSelect={() => toggleDarkMode()} className="flex items-center w-full">
      {settings.isDarkMode ? (
        <>
          <span role="img" aria-label="Sun smiling">
            <FiSun size={16} className="mr-2" />
          </span>
          Switch to Light Mode
        </>
      ) : (
        <>
          <span role="img" aria-label="Moon">
            <FiMoon size={16} className="mr-2" />
          </span>
          Switch to Dark Mode
        </>
      )}
    </MenuItem>
  );
}

export default function DropdownUI() {
  const [currentUser] = useCurrentUser();

  return (
    <Menu>
      <MenuButton className="appearance-none border-0">
        <FiMenu size={16} />
      </MenuButton>
      <MenuList className="shadow-md dark:bg-onyx-800 animate-from-left">
        {currentUser.username && (
          <User border colors={["#FEB692", "#EA5455"]} name={currentUser.username} />
        )}
        <MenuLink
          to={Routes.DASHBOARD}
          as={NextMenuLink}
          className="flex items-center w-full">
          <span role="img" aria-label="Stack of books">
            <FiBook size={16} className="mr-2" />
          </span>
          All Entries
        </MenuLink>
        <MenuLink
          to={Routes.NEW}
          as={NextMenuLink}
          className="flex items-center w-full">
          <span role="img" aria-label="Writing with a Pen">
            <FiEdit3 size={16} className="mr-2" />
          </span>
          Create New Entry
        </MenuLink>
        <MenuLink
          to={Routes.SETTINGS}
          as={NextMenuLink}
          className="flex items-center w-full">
          <span role="img" aria-label="Gear">
            <FiSettings size={16} className="mr-2" />
          </span>
          Settings
        </MenuLink>

        <MenuLink
          to={Routes.SIGN_OUT}
          as={NextMenuLink}
          className="flex items-center w-full">
          <span role="img" aria-label="Fearful face">
            <FiLogOut size={16} className="mr-2" />
          </span>
          Sign Out
        </MenuLink>
      </MenuList>
    </Menu>
  );
}
