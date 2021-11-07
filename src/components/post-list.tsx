import { useState } from "react";
import { Card } from "./card";
import { LayoutControl } from "./layout-control";
import { PostListItem } from "./post-list-item";

import classNames from "@utils/classnames";
import { IEntry } from "../__generated__/client";
import { IPartialFeedItem } from "../store/dashboard";
import { PageTitle } from "./page-title";

export type IFeedList = Pick<IEntry, "title" | "dateAdded" | "id" | "public">[];

interface IPostListProps {
  posts: IFeedList;
  onSelect: ({ id, title }: IPartialFeedItem) => void;
}

export const PostList: React.VFC<IPostListProps> = (props) => {
  const [isGridView, setGrid] = useState(false);

  const testID = isGridView ? "ENTRIES_GRIDVIEW" : "ENTRIES_LISTVIEW";

  return (
    <div>
      <header>
        <PageTitle>Entries</PageTitle>
        <LayoutControl layout={isGridView} layoutChange={setGrid} />
      </header>

      <ul
        className={classNames(isGridView && "grid", !isGridView && "list")}
        data-testid={testID}>
        {props.posts.map((p, i) =>
          !isGridView ? (
            <PostListItem
              key={i}
              title={p.title!}
              dateAdded={p.dateAdded!}
              public={p.public!}
              id={p.id!}
              onDelete={props.onSelect}
            />
          ) : (
            <li key={i}>
              <Card
                title={p.title!}
                dateAdded={p.dateAdded!}
                public={p.public!}
                id={p.id!}
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
          }
          ul {
            list-style: none inside;
            margin: 0;
            padding: 0;
          }

          div {
            padding: 0 0.5rem;
          }

          .grid {
            max-width: 84rem;
            margin: 1rem auto;
          }

          .list {
            max-width: 24rem;
            margin: 1rem auto;
          }
        `}
      </style>
    </div>
  );
};
