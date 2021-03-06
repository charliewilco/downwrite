import Image from "next/image";
import Link from "next/link";
import { Routes } from "@utils/routes";
import classNames from "@utils/classnames";

export default function EmptyPosts(): JSX.Element {
  const buttonLinkClass = classNames(
    "transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110",
    "bg-pixieblue-400 hover:bg-pixieblue-900 text-white font-bold py-2 px-4 rounded",
    "cursor-pointer inline-block"
  );
  return (
    <section className="mx-auto max-w-lg" id="NO_ENTRIES_PROMPT">
      <div className="py-8 flex items-center flex-col">
        <div className="w-full max-w-xxs mb-8 flex justify-center">
          <Image
            width={96}
            height={96}
            className="object-contain block"
            src="/static/nib.svg"
          />
        </div>
        <div className="text-center flex-1">
          <h4 className="text-xl font-mono mb-16">
            Looks like you don't have any entries
          </h4>
          <Link href={Routes.NEW}>
            <a data-testid="GET_STARTED_LINK" className={buttonLinkClass}>
              Get Started &rarr;{" "}
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
