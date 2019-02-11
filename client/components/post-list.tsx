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

export default class PostList extends React.Component<IPostListProps, {}> {
  public render(): JSX.Element {
    const { posts, onDelete } = this.props;

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
                {posts.map(p => (
                  <GridItem key={p.id}>
                    <Card {...p} onDelete={() => onDelete(p)} />
                  </GridItem>
                ))}
              </Grid>
            ) : (
              <List data-testid="ENTRIES_LISTVIEW">
                {posts.map(p => (
                  <PostListItem key={p.id} {...p} onDelete={() => onDelete(p)} />
                ))}
              </List>
            )}
          </>
        )}
      </Toggle>
    );
  }
}
