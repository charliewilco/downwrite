import Link from "next/link";
import { Routes } from "@utils/routes";

const GITHUB = "https://github.com/charliewilco/downwrite";
const TWITTER = "https://twitter.com/charlespeters";

const PAGES = [
  { name: "About", href: Routes.ABOUT },
  { name: "Legal", href: Routes.LEGAL },
  { name: "GitHub", href: GITHUB },
  { name: "@charlespeters", href: TWITTER }
] as const;

export function UIFooter() {
  const date = new Date(Date.now());
  return (
    <footer className="max-w-2xl py-8 px-4 mx-auto">
      <nav>
        <ul className="text-center p-0 m-0 text-sm">
          <li className="inline-block mr-4">
            <span>&copy; {date.getFullYear()} Charlie Peters</span>
          </li>
          {PAGES.map(({ href, name }, i) => (
            <li key={i} className="inline-block mr-4">
              <Link href={href} passHref>
                <a className="dark:text-white leading-none cursor-pointer opacity-50 text-sm">
                  {name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
