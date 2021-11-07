import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import classNames from "../utils/classnames";
import { IEntry } from "../__generated__/client";
import { PostGrid } from "@reducers/list";
import { IPartialFeedItem } from "../reducers/dashboard";
import { PageTitle } from "./page-title";
import { useLocalObservable } from "mobx-react";

export type IFeedList = Pick<IEntry, "title" | "dateAdded" | "id" | "public">[];

interface IPostListProps {
  posts: IFeedList;
  onSelect: ({ id, title }: IPartialFeedItem) => void;
}

export default function PostList(props: IPostListProps): JSX.Element {
  const grid = useLocalObservable(() => new PostGrid());

  const testID = grid.isGridView ? "ENTRIES_GRIDVIEW" : "ENTRIES_LISTVIEW";

  return (
    <>
      <header className="flex justify-between mb-6 items-center">
        <PageTitle>Entries</PageTitle>
        <LayoutControl layout={grid.isGridView} layoutChange={grid.setGrid} />
      </header>

      <ul
        className={classNames(
          "w-full list-none list-inside",
          grid.isGridView &&
            "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4",
          !grid.isGridView &&
            "max-w-xl mx-auto divide-y divide-opacity-50 divide-onyx-300"
        )}
        data-testid={testID}>
        {props.posts.map((p, i) =>
          !grid.isGridView ? (
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
    </>
  );
}
