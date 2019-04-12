import * as React from "react";
import * as Draft from "draft-js";
import Link from "next/link";
import distance from "date-fns/distance_in_words_to_now";
import * as DefaultStyles from "../utils/defaultStyles";
import { IPost } from "downwrite";

interface ICardLinks {
  id: string;
  title?: string;
  style?: React.CSSProperties;
}

export function EditLink(props: ICardLinks): JSX.Element {
  return (
    <Link prefetch passHref href={{ pathname: "/edit", query: { id: props.id } }}>
      <a className="link" style={props.style}>
        {props.title || "Edit"}
      </a>
    </Link>
  );
}

export function PreviewLink(props: ICardLinks): JSX.Element {
  return (
    <Link prefetch passHref href={{ pathname: "/preview", query: { id: props.id } }}>
      <a className="link" style={props.style}>
        Preview
      </a>
    </Link>
  );
}

export interface ICardProps {
  title: string;
  content: Draft.RawDraftContentState;
  excerpt?: string;
  id: string;
  dateAdded: Date;
  onDelete?: ({ id }: Partial<IPost>) => void;
  public: boolean;
}

export default function Card(props: ICardProps) {
  function onDelete() {
    props.onDelete({ id: props.id });
  }

  return (
    <div className="container" data-testid="CARD">
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-weight: 400;
          padding: 8px;
          box-shadow: var(--shadow);
          background: var(--cardBackground);
        }

        .container a {
          cursor: pointer;
        }

        header {
          display: block;
          border-bottom: 1px solid var(--border);
          padding: 0 0 12px;
          margin-bottom: 42px;
        }

        h2 {
          font-size: 14px;
          margin-bottom: 0px;
          font-weight: 700;
        }

        .meta {
          font-size: 12px;
          display: block;
          color: var(--meta);
          font-weight: 400;
        }

        .tray {
          display: flex;
          font-weight: 700;
          font-size: 12px;
          justify-content: space-between;
        }

        .tray a:hover {
          color: ${DefaultStyles.colors.blue500};
        }

        .delete-button {
          color: var(--cardDeleteButton);
          border: 0px;
          background: none;
          appearance: none;
          font-family: inherit;
          box-sizing: inherit;
          font-size: 12px;
          -webkit-font-smoothing: antialiased;
        }

        @media (min-width: 57.75rem) {
          h2 {
            font-size: 18px;
          }
        }
      `}</style>
      <header>
        <h2 data-testid="CARD_TITLE">
          <EditLink title={props.title} id={props.id} />
        </h2>
        <small className="meta">added {distance(props.dateAdded)} ago</small>
      </header>
      <footer className="tray">
        <div className="links" data-testid="CARD_EXCERPT">
          <EditLink style={{ marginRight: 8 }} id={props.id} />
          {props.public && <PreviewLink style={{ marginRight: 8 }} id={props.id} />}
        </div>
        {props.onDelete && (
          <button
            className="delete-button"
            data-testid="CARD_DELETE_BUTTON"
            onClick={onDelete}>
            Delete
          </button>
        )}
      </footer>
    </div>
  );
}
