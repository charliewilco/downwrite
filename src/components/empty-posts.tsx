import Link from "next/link";
import Nib from "./nib";
import { Routes } from "../utils/routes";

export default function EmptyPosts(): JSX.Element {
  return (
    <section className="mx-auto max-w-lg" data-testid="NO_ENTRIES_PROMPT">
      <div className="pt-64i flex items-center flex-col">
        <div className="w-full max-w-sm mb-8">
          <Nib />
        </div>
        <div className="text-center flex-1">
          <h4 className="text-xl mb-4">Looks like you don't have any entries</h4>
          <Link href={Routes.NEW}>
            <a className="cursor-pointer">Get Started &rarr; </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
