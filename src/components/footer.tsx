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
    <footer>
      <nav>
        <ul>
          {PAGES.map(({ href, name }, i) => (
            <li key={i}>
              <Link href={href} passHref>
                <a>{name}</a>
              </Link>
            </li>
          ))}
        </ul>
        <div className="copy">
          <small>&copy; {date.getFullYear()} Charlie Peters</small>
        </div>
      </nav>

      <style jsx>{`
        footer {
          margin: 0 auto;
          padding: 2rem 1rem;
          text-align: center;
        }

        ul {
          list-style: none inside;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        li {
          margin: 0 0.25rem;
        }

        .copy {
          text-transform: uppercase;
          opacity: 0.5;
        }

        small {
          font-family: var(--monospace);
        }
      `}</style>
    </footer>
  );
}
