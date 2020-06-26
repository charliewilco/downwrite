import Link from "next/link";
import Avatar from "./avatar";
import { Routes } from "../pages/routes";

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
        <>
          <hr />
          <p className="AuthorBlockContent">
            <span>
              You can write and share on Downwrite, you can sign up or log in{" "}
            </span>
            <Link href={Routes.LOGIN} passHref>
              <a>here</a>
            </Link>
          </p>
        </>
      )}
    </aside>
  );
}
