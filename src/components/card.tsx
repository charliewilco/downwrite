import { useCallback } from "react";
import distance from "date-fns/formatDistanceToNow";
import { EditLink, PreviewLink } from "./entry-links";
import type { IPartialFeedItem } from "@store/modules/dashboard";

export interface ICardProps {
  title: string;
  excerpt?: string;
  id: string;
  dateAdded: Date | string;
  onDelete: ({ id, title }: IPartialFeedItem) => void;
  public: boolean;
}

export function Card(props: ICardProps): JSX.Element {
  const onDelete = useCallback(() => {
    if (props.onDelete) {
      props.onDelete({ id: props.id, title: props.title });
    }
  }, [props.onDelete, props.id, props.title]);

  return (
    <div className="card" data-testid="CARD">
      <header>
        <h2 data-testid="CARD_TITLE">
          <EditLink title={props.title} id={props.id} />
        </h2>
        {props.dateAdded && (
          <small>added {distance(new Date(props.dateAdded))} ago</small>
        )}
      </header>
      <footer>
        <div className="links" data-testid="CARD_EXCERPT">
          <EditLink id={props.id} />
          {props.public && <PreviewLink id={props.id} />}
        </div>
        {props.onDelete && (
          <button data-testid="CARD_DELETE_BUTTON" onClick={onDelete}>
            Delete
          </button>
        )}
      </footer>

      <style jsx>
        {`
          .card {
            background: var(--surface);
            padding: 0.5rem;
            box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);
          }

          header {
            margin-bottom: 3rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid;
          }

          h2 {
            font-weight: 700;
            font-size: 1rem;
          }

          footer {
            display: flex;
            justify-content: space-between;
            font-size: small;
          }

          .links {
            display: flex;
            gap: 0.5rem;
          }

          button {
            appearance: none;
            border: 0;
            background: none;
            font-size: inherit;
            color: var(--highlight);
          }

          @media (prefers-color-scheme: dark) {
            .card {
            }

            header {
              border-bottom-color: var(--onyx-600);
            }
          }
        `}
      </style>
    </div>
  );
}
