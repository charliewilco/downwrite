import * as React from "react";
import Link from "next/link";
import Avatar from "./avatar";

interface IAuthorProps {
  authed: boolean;
  name: string;
  colors: string[];
}

export default function Author(props: IAuthorProps): JSX.Element {
  return (
    <aside className="Sheet AuthorBlock Wrapper Wrapper--sm">
      <header className="AuthorBlockHeader">
        <Avatar colors={props.colors} />
        <h6 className="AuthorBlockTitle">Post from {props.name}</h6>
      </header>
      {!props.authed && (
        <React.Fragment>
          <hr />
          <p className="AuthorBlockContent">
            <span>
              You can write and share on Downwrite, you can sign up or log in{" "}
            </span>
            <Link href="/login">
              <a>here</a>
            </Link>
          </p>
        </React.Fragment>
      )}
    </aside>
  );
}