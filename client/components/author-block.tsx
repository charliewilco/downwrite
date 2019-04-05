import * as React from "react";
import Link from "next/link";
import Avatar from "./avatar";
import * as DefaultStyles from "../utils/defaultStyles";

const TeaserCopy: React.FC<{}> = () => (
  <>You can write and share on Downwrite, you can sign up or log in </>
);

interface IAuthorProps {
  authed: boolean;
  name: string;
  colors: string[];
}

const Author: React.FC<IAuthorProps> = props => (
  <aside>
    <header>
      <Avatar colors={props.colors} />
      <h6>Post from {props.name}</h6>
    </header>
    {!props.authed && (
      <>
        <hr />
        <p>
          <TeaserCopy />
          <Link prefetch href="/login">
            <a>here</a>
          </Link>
        </p>
      </>
    )}
    <style jsx>{`
      aside {
        display: block;
        max-width: 512px;
        margin: 0 auto;
        padding: 16px 8px;
        background-color: var(--cardBackground);
        box-shadow: var(--shadow);
      }

      p {
        margin-bottom: 0 !important;
        color: red;
        font-family: ${DefaultStyles.Fonts.monospace};
        font-size: small;
        font-style: italic;
        color: #b4b4b4;
      }

      hr {
        height: 1px;
        margin: 16px 0;
        border: 0;
        background: rgba(0, 0, 0, 0.125);
      }

      header {
        display: flex;
        align-items: center;
      }

      h6 {
        font-size: 18px;
        font-weight: 400;
        margin-left: 16px;
      }
    `}</style>
  </aside>
);

export default Author;
