import React, { useCallback } from "react";
import distance from "date-fns/formatDistanceToNow";
import { EditLink, PreviewLink } from "./entry-links";
import { IPartialFeedItem } from "@reducers/dashboard";

export interface ICardProps {
  title: string;
  excerpt?: string;
  id: string;
  dateAdded: Date | string;
  onDelete: ({ id, title }: IPartialFeedItem) => void;
  public: boolean;
}

export default function Card(props: ICardProps): JSX.Element {
  const onDelete = useCallback(() => {
    if (props.onDelete) {
      props.onDelete({ id: props.id, title: props.title });
    }
  }, [props.onDelete, props.id, props.title]);

  return (
    <div className="shadow-md dark:bg-onyx-800 p-2" data-testid="CARD">
      <header className="border-b-2 dark:border-onyx-600 pb-2 mb-12">
        <h2 className="text-base leading-none" data-testid="CARD_TITLE">
          <EditLink title={props.title} id={props.id} />
        </h2>
        {props.dateAdded && (
          <small className="opacity-50 text-xs">
            added {distance(new Date(props.dateAdded))} ago
          </small>
        )}
      </header>
      <footer className="text-xs flex font-bold justify-between">
        <div data-testid="CARD_EXCERPT">
          <EditLink className="mr-2" id={props.id} />
          {props.public && <PreviewLink className="mr-2" id={props.id} />}
        </div>
        {props.onDelete && (
          <button
            className="text-xs font-bold"
            data-testid="CARD_DELETE_BUTTON"
            onClick={onDelete}>
            Delete
          </button>
        )}
      </footer>
    </div>
  );
}
