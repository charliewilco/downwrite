import * as React from "react";
import Link from "next/link";
import AltAnchor from "./alt-anchor-link";

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
    <footer className="AppFooter Wrapper Wrapper--sm">
      <nav className="AppFooterNav">
        <ul>
          <li>
            <span>&copy; 2019 Charles Peters</span>
          </li>
          {PAGES.map((page, i) => (
            <li key={i}>
              <Link href={page.href} passHref>
                <AltAnchor>{page.name}</AltAnchor>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
