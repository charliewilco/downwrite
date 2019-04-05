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

const UIFooter: React.FC<{}> = () => (
  <footer className="ui-footer Wrapper Wrapper--sm">
    <nav className="ui-footer-nav">
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
    <style jsx>{`
      .ui-footer {
        text-align: center;
        padding-top: 32px;
        padding-bottom: 32px;
        padding-left: 8px;
        padding-right: 8px;
      }

      .ui-footer-nav::before {
        content: "";
        display: block;
        width: 128px;
        height: 2px;
        background: var(--link);
        margin: 0 auto 32px;
      }

      .ui-footer-nav ul {
        list-style: none inside;
        padding: 0;
        margin: 0;
        font-size: 14px;
      }

      .ui-footer-nav li {
        display: inline-block;
        margin-right: 16px;
      }
    `}</style>
  </footer>
);

export default UIFooter;
