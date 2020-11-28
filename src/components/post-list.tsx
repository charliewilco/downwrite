import { useReducer } from "react";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import classNames from "../utils/classnames";
import { IEntry } from "../utils/generated";
import { listReducer, ListActions } from "@reducers/list";
import { IPartialFeedItem } from "../reducers/dashboard";
import { PageTitle } from "./page-title";

export type IFeedList = Pick<IEntry, "title" | "dateAdded" | "id" | "public">[];

interface IPostListProps {
  posts: IFeedList;
  onSelect: ({ id, title }: IPartialFeedItem) => void;
}

export default function PostList(props: IPostListProps): JSX.Element {
  const [state, dispatch] = useReducer(listReducer, {
    isGridView: true
  });

  const testID = state.isGridView ? "ENTRIES_GRIDVIEW" : "ENTRIES_LISTVIEW";

  return (
    <>
      <header className="flex justify-between mb-6 items-center">
        <PageTitle>Entries</PageTitle>
        <LayoutControl
          layout={state.isGridView}
          layoutChange={(payload) => dispatch({ type: ListActions.SET, payload })}
        />
      </header>

      <ul
        className={classNames(
          "w-full list-none list-inside",
          state.isGridView &&
            "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4",
          !state.isGridView &&
            "max-w-xl mx-auto divide-y divide-opacity-50 divide-onyx-300"
        )}
        data-testid={testID}>
        {props.posts.map((p, i) =>
          !state.isGridView ? (
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
