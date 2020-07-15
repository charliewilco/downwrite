import Link from "next/link";
import { Routes } from "../utils/routes";

interface IPage {
  name: string;
  external?: boolean;
  href: string;
}

const PAGES: IPage[] = [
  { name: "About", href: Routes.ABOUT },
  { name: "Legal", href: Routes.LEGAL },
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

export function UIFooter() {
  const date = new Date(Date.now());
  return (
    <footer className="max-w-2xl py-8 px-4 mx-auto">
      <nav>
        <ul className="text-center p-0 m-0 text-sm">
          <li className="inline-block mr-4">
            <span>&copy; {date.getFullYear()} Charles Peters</span>
          </li>
          {PAGES.map((page, i) => (
            <li key={i} className="inline-block mr-4">
              {page.external ? (
                <a
                  className="text-white leading-none cursor-pointer opacity-50 text-sm"
                  href={page.href}>
                  {page.name}
                </a>
              ) : (
                <Link href={page.href}>
                  <a className="text-white leading-none cursor-pointer opacity-50 text-sm">
                    {page.name}
                  </a>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
