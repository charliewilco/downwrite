import * as React from "react";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import { IPost } from "downwrite";
import classNames from "../utils/classnames";

interface IPostListProps {
  posts: IPost[];
  onSelect: ({ id }: Partial<IPost>) => void;
}

export default function PostList(props: IPostListProps): JSX.Element {
  const [isGridView, setOpen] = React.useState<boolean>(false);
  const testID = isGridView ? "ENTRIES_GRIDVIEW" : "ENTRIES_LISTVIEW";
  const className = classNames(
    "PostList",
    isGridView && "Grid",
    !isGridView && "Wrapper Wrapper--sm"
  );

  return (
    <React.Fragment>
      <header className="PostListHeader">
        <h1 className="ContainerTitle">Entries</h1>
        <LayoutControl layout={isGridView} layoutChange={setOpen} />
      </header>

      <ul className={className} data-testid={testID}>
        {props.posts.map((p, i) =>
          !isGridView ? (
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
