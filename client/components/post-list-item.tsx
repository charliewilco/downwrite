import * as React from "react";
import Link from "next/link";
import distance from "date-fns/distance_in_words_to_now";

import { PreviewLink } from "./card";
import { IPost } from "downwrite";

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
    props.onDelete({ id: props.id });
  }

  return (
    <div className="PostItem">
      <div>
        <h2 className="PostItemTitle">
          <Link prefetch href={{ pathname: "/edit", query: { id: props.id } }}>
            <a>{props.title}</a>
          </Link>

          {props.public && (
            <div className="PostItemTray">
              <PreviewLink id={props.id} />
            </div>
          )}
        </h2>
        <small className="PostItemMeta">added {distance(props.dateAdded)} ago</small>
      </div>
      {props.onDelete && (
        <button className="PostItemDeleteButton" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  );
}
