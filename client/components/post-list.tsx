import * as React from "react";
import styled from "styled-components";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import ContainerTitle from "./container-title";
import Toggle from "./toggle";
import { Grid, GridItem } from "./post-grid";

const ListHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const List = styled.ul`
  width: 100%;
  list-style: inside none;
`;

export const PostContainer = styled.div`
  padding: 16px 8px;
`;

interface IPostListProps {
  posts: any[];
  onDelete: (post: any) => void;
}

const PostList: React.FC<IPostListProps> = function(props) {
  return (
    <Toggle defaultOpen>
      {({ isOpen, onSetInstance }) => (
        <>
          <ListHeader>
            <ContainerTitle>Entries</ContainerTitle>
            <LayoutControl layout={isOpen} layoutChange={onSetInstance} />
          </ListHeader>
          {isOpen ? (
            <Grid data-testid="ENTRIES_GRIDVIEW">
              {props.posts.map((p, i) => (
                <GridItem key={i}>
                  <Card {...p} onDelete={() => props.onDelete(p)} />
                </GridItem>
              ))}
            </Grid>
          ) : (
            <List data-testid="ENTRIES_LISTVIEW">
              {props.posts.map((p, i) => (
                <PostListItem key={i} {...p} onDelete={() => props.onDelete(p)} />
              ))}
            </List>
          )}
        </>
      )}
    </Toggle>
  );
};

export default PostList;
