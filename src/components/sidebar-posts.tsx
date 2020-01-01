import * as React from "react";
import PostListItem from "./post-list-item";

interface ISidebarPostProps {
  posts: any[];
}

export default function SidebarPosts(props: ISidebarPostProps): JSX.Element {
  return (
    <React.Fragment>
      <h6 style={{ fontSize: 12, marginBottom: 8 }}>Recent Entries</h6>
      {props.posts.slice(0, 2).map((post, i) => (
        <div style={{ marginBottom: 16 }} key={i}>
          <PostListItem {...post} />
        </div>
      ))}
    </React.Fragment>
  );
}
