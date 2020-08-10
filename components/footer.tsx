import * as React from "react";
import Link from "next/link";
import { AltAnchorLink } from "./alt-anchor-link";

interface IPage {
  name: string;
  href: string;
}

const PAGES: IPage[] = [
  { name: "About", href: "/about" },
  { name: "Legal", href: "/legal" },
  { name: "Source Code", href: "https://github.com/charliewilco/downwrite" },
  { name: "@charlespeters", href: "https://twitter.com/charlespeters" }
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
              {page.href.includes("http") ? (
                <AltAnchorLink href={page.href}>{page.name}</AltAnchorLink>
              ) : (
                <Link href={page.href} passHref>
                  <AltAnchorLink>{page.name}</AltAnchorLink>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
