import * as React from "react";
import Link from "next/link";
import Avatar from "./avatar";

interface IAuthorProps {
  authed: boolean;
  name: string;
  colors: string[];
}

function TeaserCopy(): JSX.Element {
  return <>You can write and share on Downwrite, you can sign up or log in </>;
}

export default function Author(props: IAuthorProps): JSX.Element {
  return (
    <aside className="AuthorBlock">
      <header className="AuthorBlockHeader">
        <Avatar colors={props.colors} />
        <h6 className="AuthorBlockTitle">Post from {props.name}</h6>
      </header>
      {!props.authed && (
        <>
          <hr />
          <p className="AuthorBlockContent">
            <TeaserCopy />
            <Link prefetch href="/login">
              <a>here</a>
            </Link>
          </p>
        </>
      )}
    </aside>
  );
}
