import Image from "next/image";
import Link from "next/link";
import { Routes } from "@utils/routes";

export function EmptyPosts(): JSX.Element {
  return (
    <section id="NO_ENTRIES_PROMPT">
      <div>
        <div>
          <Image width={96} height={96} src="/static/nib.svg" />
        </div>
        <div>
          <h4>Looks like you don't have any entries</h4>
          <Link href={Routes.NEW}>
            <a data-testid="GET_STARTED_LINK">Get Started &rarr; </a>
          </Link>
        </div>
      </div>
      <style jsx>
        {`
          section {
            max-width: 24rem;
            margin: 0 auto;
            text-align: center;
          }

          h4 {
            font-family: var(--monospace);
          }

          a {
          }
        `}
      </style>
    </section>
  );
}
