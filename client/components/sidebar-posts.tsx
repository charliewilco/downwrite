import * as React from "react";
import PostListItem from "./post-list-item";

const SidebarPosts: React.FC<{ posts: any[] }> = ({ posts }) => (
  <>
    <h6 style={{ fontSize: 12, marginBottom: 8 }}>Recent Entries</h6>
    {posts.slice(0, 2).map((post, i) => (
      <div style={{ marginBottom: 16 }} key={i}>
        <PostListItem {...post} />
      </div>
    ))}
  </>
);

export default SidebarPosts;
