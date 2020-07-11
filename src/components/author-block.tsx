import Link from "next/link";
import Avatar from "./avatar";
import { Routes } from "../utils/routes";

interface IAuthorProps {
  authed: boolean;
  name: string;
  colors: string[];
}

export default function Author(props: IAuthorProps): JSX.Element {
  return (
    <aside className="shadow-md py-4 px-2">
      <header className="flex items-center">
        <Avatar colors={props.colors} />
        <h6 className="text-base font-normal ml-4">Post from {props.name}</h6>
      </header>
      {!props.authed && (
        <>
          <hr className="h-px my-4 mx-0 bg-onyx-100" />
          <p className="text-small italic mb-0">
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
