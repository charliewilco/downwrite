import * as React from "react";
import styled from "styled-components";
import Card from "./card";
import LayoutControl from "./layout-control";
import PostListItem from "./post-list-item";
import ContainerTitle from "./container-title";
import { Grid, GridItem } from "./post-grid";

export const PostContainer = styled.div`
  padding: 16px 8px;
`;

interface IPostListProps {
  posts: any[];
  onDelete: (post: any) => void;
}

const PostList: React.FC<IPostListProps> = function(props) {
  const [isOpen, setOpen] = React.useState<boolean>(true);

  return (
    <>
      <header>
        <ContainerTitle>Entries</ContainerTitle>
        <LayoutControl layout={isOpen} layoutChange={setOpen} />
      </header>
      {isOpen ? (
        <Grid data-testid="ENTRIES_GRIDVIEW">
          {props.posts.map((p, i) => (
            <GridItem key={i}>
              <Card {...p} onDelete={() => props.onDelete(p)} />
            </GridItem>
          ))}
        </Grid>
      ) : (
        <ul data-testid="ENTRIES_LISTVIEW">
          {props.posts.map((p, i) => (
            <PostListItem key={i} {...p} onDelete={() => props.onDelete(p)} />
          ))}
        </ul>
      )}
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        ul {
          width: 100%;
          list-style: inside none;
        }
      `}</style>
    </>
  );
};

export default PostList;
