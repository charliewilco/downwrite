import * as React from "react";
import styled from "styled-components";
import PostListItem from "./post-list-item";

const SidebarEntriesTitle = styled.h6`
  font-size: 12px;
  margin-bottom: 8px;
`;

const Separator = styled.div`
  margin-bottom: 1rem;
`;

const SidebarPosts: React.SFC<{ posts: any[] }> = ({ posts }) => (
  <>
    <SidebarEntriesTitle>Recent Entries</SidebarEntriesTitle>
    {posts.slice(0, 2).map((post, i) => (
      <Separator key={i}>
        <PostListItem {...post} />
      </Separator>
    ))}
  </>
);

export default SidebarPosts;
