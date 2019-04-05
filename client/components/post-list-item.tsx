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

const ListItem: React.FC<IListItemProps> = props => {
  function onDelete() {
    props.onDelete({ id: props.id });
  }

  return (
    <div className="PostItem">
      <div>
        <h2 className="PostTitle">
          <Link prefetch href={{ pathname: "/edit", query: { id: props.id } }}>
            <a>{props.title}</a>
          </Link>

          {props.public && (
            <div className="PostItemTray">
              <PreviewLink id={props.id} />
            </div>
          )}
        </h2>
        <small className="PostMeta">added {distance(props.dateAdded)} ago</small>
      </div>
      {props.onDelete && (
        <button className="DeleteButton" onClick={onDelete}>
          Delete
        </button>
      )}

      <style jsx>
        {`
          .PostItem {
            padding: 16px 0;

            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .PostTitle {
            font-size: 16px;
            font-weight: 700;
          }

          .PostItem:not(:last-of-type) {
            border-bottom: 1px solid #ccc;
          }

          .PostItemTray {
            margin-left: 16px;
            display: inline-block;
            font-size: 12px;
          }

          .DeleteButton {
            color: inherit;
            appearance: none;
            border: 0px;
            font-family: inherit;
            background: none;
          }

          .PostMeta {
            font-size: 12px;
            display: block;
            color: var(--meta);
            font-weight: 400;
            margin-bottom: 8px;
          }

          @media (min-width: 57.75rem) {
            .PostTitle {
              font-size: 18px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ListItem;
