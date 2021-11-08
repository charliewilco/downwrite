import Link from "next/link";
import distance from "date-fns/formatDistanceToNow";
import { EditLink, PreviewLink } from "./entry-links";
import type { IPartialFeedItem } from "@store/modules/dashboard";

interface IListItemProps {
  title: string;
  id: string;
  dateAdded: Date;
  onDelete: ({ id, title }: IPartialFeedItem) => void;
  public: boolean;
}

export function PostListItem(props: IListItemProps): JSX.Element {
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
            <EditLink id={props.id} />
            {props.public && <PreviewLink id={props.id} />}
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
