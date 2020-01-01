import * as React from "react";
import Link from "next/link";

interface IPage {
  name: string;
  external?: boolean;
  href: string;
}

const PAGES: IPage[] = [
  { name: "About", href: "/about" },
  { name: "Legal", href: "/legal" },
  {
    name: "Source Code",
    href: "https://github.com/charliewilco/downwrite",
    external: true
  },
  {
    name: "@charlespeters",
    href: "https://twitter.com/charlespeters",
    external: true
  }
];

export default function UIFooter() {
  return (
    <footer className="AppFooter Wrapper Wrapper--md">
      <nav className="AppFooterNav">
        <ul className="u-center">
          <li>
            <span>&copy; 2019 Charles Peters</span>
          </li>
          {PAGES.map((page, i) => (
            <li key={i}>
              {page.external ? (
                <a className="AltLink" href={page.href}>
                  {page.name}
                </a>
              ) : (
                <Link href={page.href} passHref>
                  <a className="AltLink">{page.name}</a>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
