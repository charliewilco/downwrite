import * as React from "react";
import styled from "styled-components";
import PostListItem from "./post-list-item";
import { fonts } from "../utils/defaultStyles";

const SidebarEntriesTitle = styled.h6`
  font-size: 12px;
  margin-bottom: 8px;
  font-family: ${fonts.sans};
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
