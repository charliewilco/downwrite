import Link from "next/link";
import distance from "date-fns/formatDistanceToNow";
import { EditLink, PreviewLink } from "./entry-links";
import { IPartialFeedItem } from "@store/dashboard";

interface IListItemProps {
  title: string;
  id: string;
  dateAdded: Date;
  onDelete: ({ id, title }: IPartialFeedItem) => void;
  public: boolean;
}

export default function PostListItem(props: IListItemProps): JSX.Element {
  function onDelete() {
    props.onDelete({ id: props.id, title: props.title });
  }

  return (
    <li>
      <div
        className="p-4 border-l-2 border-transparent hover:border-pixieblue-500 transition duration-500 ease-in-out "
        data-testid="POST_LIST_ITEM">
        <div>
          <h2 className="text-base font-bold">
            <Link href="/[id]/edit" as={`/${props.id}/edit`} passHref>
              <a>{props.title}</a>
            </Link>
          </h2>
          <small className="text-sm block opacity-50 font-normal mb-2">
            added {distance(new Date(props.dateAdded))} ago
          </small>
        </div>
        <div className="tray">
          <div>
            <EditLink id={props.id} className="mr-4" />
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
