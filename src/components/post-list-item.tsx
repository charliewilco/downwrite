import * as React from "react";
import { Link } from "react-router-dom";
import distance from "date-fns/formatDistanceToNow";
import parseISO from "date-fns/parseISO";
import { EditLink, PreviewLink } from "./entry-links";
import { IPartialFeedItem } from "../reducers/dashboard";

interface IListItemProps {
  title: string;
  id: string;
  dateAdded: Date;
  onDelete: ({ id }: IPartialFeedItem) => void;
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
          <Link to={`/edit/${props.id}`}>{props.title}</Link>
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
