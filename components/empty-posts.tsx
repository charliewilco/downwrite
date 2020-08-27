import * as React from "react";
import Link from "next/link";
import Nib from "./nib";

export default function EmptyPosts(): JSX.Element {
  return (
    <section className="Wrapper" data-testid="NO_ENTRIES_PROMPT">
      <div className="GettingStartedContainer">
        <div className="EmptyBlockRight">
          <Nib />
        </div>
        <div className="EmptyBlockLeft">
          <h4 className="GettingStartedTitle">
            Looks like you don't have any entries
          </h4>
          <Link href="/new">
            <a className="GettingStarted">Get Started &rarr;</a>
          </Link>
        </div>
      </div>
    </section>
  );
}
