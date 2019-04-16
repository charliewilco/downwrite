import * as React from "react";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import { IPost } from "downwrite";

interface IPostListProps {
  posts: any[];
  onSelect: ({ id }: Partial<IPost>) => void;
}

export default function PostList(props: IPostListProps): JSX.Element {
  const [isGridView, setOpen] = React.useState<boolean>(true);

  return (
    <>
      <header className="PostListHeader">
        <h1 className="ContainerTitle">Entries</h1>
        <LayoutControl layout={isGridView} layoutChange={setOpen} />
      </header>
      {isGridView ? (
        <ul className="PostList Grid" data-testid="ENTRIES_GRIDVIEW">
          {props.posts.map((p, i) => (
            <li className="GridItem" key={i}>
              <Card {...p} onDelete={props.onSelect} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="PostList" data-testid="ENTRIES_LISTVIEW">
          {props.posts.map((p, i) => (
            <PostListItem key={i} {...p} onDelete={props.onSelect} />
          ))}
        </ul>
      )}
    </>
  );
}
