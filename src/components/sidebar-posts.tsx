import { Fragment } from "react";
import PostListItem from "./post-list-item";
import { IEntry } from "../utils/generated";

interface ISidebarPostProps {
  posts: Omit<IEntry, "author">[];
  onDelete(...args: unknown[]): void;
}

export default function SidebarPosts(props: ISidebarPostProps): JSX.Element {
  return (
    <Fragment>
      <h6 style={{ fontSize: 12, marginBottom: 8 }}>Recent Entries</h6>
      {props.posts.slice(0, 2).map((post, i) => (
        <div style={{ marginBottom: 16 }} key={i}>
          <PostListItem {...post} onDelete={props.onDelete} />
        </div>
      ))}
    </Fragment>
  );
}
