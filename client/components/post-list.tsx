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
  list-style: inside none;
`;

export const ListContainer = styled.div`
  padding: 16px 8px;
`;

const ListItemContainer = styled.li`
  padding: 16px 0;
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  flex: 1;

  &:not(:last-of-type) {
    border-bottom: 1px solid #ccc;
  }
`;

interface IPostListProps {
  posts: any[];
  onDelete: (post: any) => void;
}

export default class PostList extends React.Component<IPostListProps, {}> {
  render() {
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
                  <ListItemContainer key={p.id}>
                    <PostListItem {...p} onDelete={() => onDelete(p)} />
                  </ListItemContainer>
                ))}
              </List>
            )}
          </>
        )}
      </Toggle>
    );
  }
}
