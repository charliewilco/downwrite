import * as React from "react";
import * as Draft from "draft-js";
import distance from "date-fns/formatDistanceToNow";

import { IPost } from "downwrite";
import { EditLink, PreviewLink } from "./entry-links";

export interface ICardProps {
  title: string;
  content: Draft.RawDraftContentState;
  excerpt?: string;
  id: string;
  dateAdded: Date | string;
  onDelete?: ({ id }: Partial<IPost>) => void;
  public: boolean;
}

export default function Card(props: ICardProps): JSX.Element {
  function onDelete() {
    props.onDelete({ id: props.id, title: props.title });
  }

  const date = new Date(props.dateAdded);

  return (
    <div className="Sheet Card" data-testid="CARD">
      <header className="CardHeader">
        <h2 className="CardTitle" data-testid="CARD_TITLE">
          <EditLink title={props.title} id={props.id} />
        </h2>
        <small className="CardMeta">added {distance(date)} ago</small>
      </header>
      <footer className="CardTray">
        <div className="links" data-testid="CARD_EXCERPT">
          <EditLink style={{ marginRight: 8 }} id={props.id} />
          {props.public && <PreviewLink style={{ marginRight: 8 }} id={props.id} />}
        </div>
        {props.onDelete && (
          <button
            className="CardDeleteButton"
            data-testid="CARD_DELETE_BUTTON"
            onClick={onDelete}>
            Delete
          </button>
        )}
      </footer>
    </div>
  );
}
