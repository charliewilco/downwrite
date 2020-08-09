import * as React from "react";
import Link from "next/link";
import { IPost } from "downwrite";
import distance from "date-fns/formatDistanceToNow";
import parseISO from "date-fns/parseISO";
import { EditLink, PreviewLink } from "./entry-links";

interface IListItemProps {
  title: string;
  content: Draft.RawDraftContentState;
  id: string;
  dateAdded: Date;
  onDelete: ({ id }: Partial<IPost>) => void;
  public: boolean;
}

export default function PostListItem(props: IListItemProps): JSX.Element {
  function onDelete() {
    props.onDelete({ id: props.id, title: props.title });
  }

  const date = parseISO(props.dateAdded.toString());

  return (
    <div className="PostItem" data-testid="POST_LIST_ITEM">
      <div>
        <h2 className="PostItemTitle">
          <Link href={{ pathname: "/edit", query: { id: props.id } }}>
            <a>{props.title}</a>
          </Link>
        </h2>
        <small className="PostItemMeta">added {distance(date)} ago</small>
      </div>
      <div className="PostItemTray">
        <div>
          <EditLink id={props.id} style={{ marginRight: 8 }} />
          {props.public && <PreviewLink id={props.id} />}
        </div>
        {props.onDelete && (
          <button className="PostItemDeleteButton" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
