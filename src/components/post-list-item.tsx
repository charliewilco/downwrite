import Link from "next/link";
import distance from "date-fns/formatDistanceToNow";
import { EditLink, PreviewLink } from "./entry-links";
import { IPartialFeedItem } from "@reducers/dashboard";

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
        <div className="flex justify-between items-center text-xs font-bold">
          <div>
            <EditLink id={props.id} className="mr-4" />
            {props.public && <PreviewLink id={props.id} />}
          </div>
          {props.onDelete && (
            <button className="font-bold text-xs" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
