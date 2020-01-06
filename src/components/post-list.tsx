import * as React from "react";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import classNames from "../utils/classnames";
import { IEntry } from "../utils/generated";
import { IPartialFeedItem } from "../reducers/dashboard";

export type IFeedList = Pick<IEntry, "title" | "dateAdded" | "id" | "public">[];

interface IPostListProps {
  posts: IFeedList;
  onSelect: ({ id }: IPartialFeedItem) => void;
}

enum ListActions {
  TOGGLE,
  SET
}

type ListReducerAction =
  | {
      type: ListActions.TOGGLE;
    }
  | {
      type: ListActions.SET;
      payload: boolean;
    };

interface IPostListState {
  isGridView: boolean;
}

function listReducer(
  state: IPostListState,
  action: ListReducerAction
): IPostListState {
  switch (action.type) {
    case ListActions.TOGGLE:
      return { isGridView: !state.isGridView };
    case ListActions.SET:
      return { isGridView: action.payload };
    default:
      throw new Error("Must specify action type");
  }
}

export default function PostList(props: IPostListProps): JSX.Element {
  const [state, dispatch] = React.useReducer(listReducer, {
    isGridView: true
  });

  const testID = state.isGridView ? "ENTRIES_GRIDVIEW" : "ENTRIES_LISTVIEW";
  const className = classNames(
    "PostList",
    state.isGridView && "Grid",
    !state.isGridView && "Wrapper Wrapper--sm"
  );

  return (
    <React.Fragment>
      <header className="PostListHeader">
        <h1 className="ContainerTitle">Entries</h1>
        <LayoutControl
          layout={state.isGridView}
          layoutChange={payload => dispatch({ type: ListActions.SET, payload })}
        />
      </header>

      <ul className={className} data-testid={testID}>
        {props.posts.map((p, i) =>
          !state.isGridView ? (
            <PostListItem key={i} {...p} onDelete={props.onSelect} />
          ) : (
            <li className="GridItem" key={i}>
              <Card {...p} onDelete={props.onSelect} />
            </li>
          )
        )}
      </ul>
    </React.Fragment>
  );
}
