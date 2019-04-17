import * as React from "react";
import * as Draft from "draft-js";
import distance from "date-fns/distance_in_words_to_now";
import { IPost } from "downwrite";
import { EditLink, PreviewLink } from "./entry-links";

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
    props.onDelete({ id: props.id, title: props.title });
  }

  return (
    <div className="Sheet Card" data-testid="CARD">
      <header className="CardHeader">
        <h2 className="CardTitle" data-testid="CARD_TITLE">
          <EditLink title={props.title} id={props.id} />
        </h2>
        <small className="CardMeta">added {distance(props.dateAdded)} ago</small>
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
