import Link from "next/link";
import { useState, useCallback } from "react";

import distance from "date-fns/formatDistanceToNow";

import { IEntry } from "../__generated__/client";
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
  }, [props]);

  return (
    <div className="card" data-testid="CARD">
      <header>
        <h2 data-testid="CARD_TITLE">
          <Link href="/[id]/edit" as={`/${props.id}/edit`}>
            <a>{props.title}</a>
          </Link>
        </h2>
        {props.dateAdded && (
          <small>added {distance(new Date(props.dateAdded))} ago</small>
        )}
      </header>
      <footer>
        <div className="links" data-testid="CARD_EXCERPT">
          <Link href="/[id]/edit" as={`/${props.id}/edit`}>
            <a>Edit</a>
          </Link>
          {props.public && (
            <Link href="/[id]/preview" as={`/${props.id}/preview`}>
              <a>Preview</a>
            </Link>
          )}
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

interface IListItemProps {
  title: string;
  id: string;
  dateAdded: Date;
  onDelete: ({ id, title }: IPartialFeedItem) => void;
  public: boolean;
}

function PostListItem(props: IListItemProps): JSX.Element {
  function onDelete() {
    props.onDelete({ id: props.id, title: props.title });
  }

  return (
    <li>
      <div data-testid="POST_LIST_ITEM">
        <div>
          <h2>
            <Link href="/[id]/edit" as={`/${props.id}/edit`} passHref>
              <a>{props.title}</a>
            </Link>
          </h2>
          <small>added {distance(new Date(props.dateAdded))} ago</small>
        </div>
        <div className="tray">
          <div>
            <Link href={`/${props.id}/edit`} as="/[id]/edit">
              <a>{props.title}</a>
            </Link>
            {props.public && (
              <Link href={`/${props.id}/preview`} as="/[id]/preview">
                <a>Preview</a>
              </Link>
            )}
          </div>
          {props.onDelete && (
            <button className="delete" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        li {
          width: 100%;
          display: block;
        }

        h2 {
          margin: 0;
        }

        .delete {
          appearance: none;
          background: none;
          border: 0;
        }

        .tray {
          display: flex;
          font-weight: 700;
          justify-content: space-between;
        }
      `}</style>
    </li>
  );
}

export type IFeedList = Pick<IEntry, "title" | "dateAdded" | "id" | "public">[];

interface IPostListProps {
  posts: IFeedList;
  onSelect: ({ id, title }: IPartialFeedItem) => void;
}

export const PostList: React.VFC<IPostListProps> = (props) => {
  const [isGridView, setGrid] = useState(true);

  const testID = isGridView ? "ENTRIES_GRIDVIEW" : "ENTRIES_LISTVIEW";

  return (
    <div className="container">
      <header>
        <h1 className="page-title">Entries</h1>
        <div
          role="switch"
          aria-label="Grid or List Layout"
          aria-checked={isGridView}
          className="switch">
          <div
            data-testid="LAYOUT_CONTROL_GRID"
            className={`toggleButton ${isGridView && "active"}`}
            onClick={() => setGrid(true)}>
            Grid
          </div>
          <div
            className={`toggleButton ${!isGridView && "active"}`}
            data-testid="LAYOUT_CONTROL_LIST"
            onClick={() => setGrid(false)}>
            List
          </div>
        </div>
      </header>

      <ul className={isGridView ? "grid" : "list"} data-testid={testID}>
        {props.posts.map((p, i) =>
          !isGridView ? (
            <PostListItem
              key={i}
              title={p.title}
              dateAdded={p.dateAdded}
              public={p.public}
              id={p.id}
              onDelete={props.onSelect}
            />
          ) : (
            <li key={i}>
              <Card
                title={p.title}
                dateAdded={p.dateAdded}
                public={p.public}
                id={p.id}
                onDelete={props.onSelect}
              />
            </li>
          )
        )}
      </ul>
      <style jsx>
        {`
          header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          ul {
            list-style: none inside;
            margin: 0;
            padding: 0;
          }

          .container {
            padding: 1rem 0.5rem;
          }

          .grid {
            max-width: 100%;
            margin: 0 auto;
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .list {
            max-width: 24rem;
            margin: 1rem auto;
          }

          .switch {
            display: flex;
          }

          .toggleButton {
            flex: 1;
            opacity: 50%;
            border-bottom: 4px solid transparent;
            cursor: pointer;
            font-weight: bold;
          }

          .toggleButton:first-of-type {
            margin-right: 1rem;
          }

          .toggleButton.active {
            opacity: 100%;
            border-bottom-color: #2597f1;
          }
        `}
      </style>
    </div>
  );
};
