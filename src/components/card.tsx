import { useCallback } from "react";
import distance from "date-fns/formatDistanceToNow";
import { EditLink, PreviewLink } from "./entry-links";
import { IPartialFeedItem } from "../reducers/dashboard";

export interface ICardProps {
  title: string;
  excerpt?: string;
  id: string;
  dateAdded: Date | string;
  onDelete?: ({ id }: Partial<IPartialFeedItem>) => void;
  public: boolean;
}

export default function Card(props: ICardProps): JSX.Element {
  const onDelete = useCallback(() => {
    if (props.onDelete) {
      props.onDelete({ id: props.id, title: props.title });
    }
  }, [props.onDelete, props.id, props.title]);

  return (
    <div className="Sheet Card" data-testid="CARD">
      <header className="CardHeader">
        <h2 className="CardTitle" data-testid="CARD_TITLE">
          <EditLink title={props.title} id={props.id} />
        </h2>
        {props.dateAdded && (
          <small className="CardMeta">
            added {distance(new Date(props.dateAdded))} ago
          </small>
        )}
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
