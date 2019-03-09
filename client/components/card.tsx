import * as React from "react";
import * as Draft from "draft-js";
import Link from "next/link";
import * as distance from "date-fns/distance_in_words_to_now";
import * as DefaultStyles from "../utils/defaultStyles";

interface ICardLinks {
  id: string;
  title?: string;
  style?: React.CSSProperties;
}

export const EditLink: React.FC<ICardLinks> = props => (
  <Link prefetch passHref href={{ pathname: "/edit", query: { id: props.id } }}>
    <a className="link" style={props.style}>
      {props.title || "Edit"}
    </a>
  </Link>
);

export const PreviewLink: React.FC<ICardLinks> = props => (
  <Link prefetch passHref href={{ pathname: "/preview", query: { id: props.id } }}>
    <a className="link" style={props.style}>
      Preview
    </a>
  </Link>
);

export interface ICardProps {
  title: string;
  content: Draft.RawDraftContentState;
  excerpt?: string;
  id: string;
  dateAdded: Date;
  onDelete?: () => void;
  public: boolean;
}

const Card: React.FC<ICardProps> = props => (
  <div className="container" data-testid="CARD">
    <style jsx>{`
      .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-weight: 400;
        padding: 8px;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
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
          onClick={props.onDelete}>
          Delete
        </button>
      )}
    </footer>
  </div>
);

export default Card;
