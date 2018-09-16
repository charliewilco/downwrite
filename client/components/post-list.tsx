import * as React from 'react';
import styled from 'styled-components';
import Card from './card';
import LayoutControl from './layout-control';
import PostListItem from './post-list-item';

const Title = styled.h1`
  font-weight: 500;
  font-size: 18px;

  @media (min-width: 57.75rem) {
    font-size: 24px;
  }
`;

const Grid = styled.ul`
  list-style: none inside;
  display: flex;
  flex-wrap: wrap;
  @media (min-width: 48rem) {
    margin-left: -20px;
  }
`;

const GridItem = styled.li`
  margin-bottom: 24px;
  width: 100%;

  @media (min-width: 48rem) {
    padding-left: 20px;
    width: 50%;
  }

  @media (min-width: 57.75rem) {
    width: ${`${100 / 3}%`};
  }

  @media (min-width: 75rem) {
    width: ${`${100 / 4}%`};
  }

  @media (min-width: 112.5rem) {
    width: ${`${100 / 5}%`};
  }

  @media (min-width: 150rem) {
    width: ${`${100 / 6}%`};
  }

  @media (min-width: 187.5rem) {
    width: ${`${100 / 7}%`};
  }
`;

const ListHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ListItemContainer = styled.li`
  padding: 16px 0;
  width: 100%;
  flex: 1;

  &:not(:last-of-type) {
    border-bottom: 1px solid #ccc;
  }
`;

const List = styled.ul`
  list-style: inside none;
`;

type LayoutType = string | 'grid' | 'list';

interface IPostListProps {
  posts: any[];
  onDelete: (post: any) => void;
}

interface IPostListState {
  layout: LayoutType;
}

export default class PostList extends React.Component<
  IPostListProps,
  IPostListState
> {
  state = {
    layout: 'grid'
  };

  layoutChange = (x: LayoutType) => {
    return this.setState({ layout: x });
  };

  render() {
    const { posts, onDelete } = this.props;
    const { layout } = this.state;
    return (
      <>
        <ListHeader>
          <Title>Entries</Title>
          <LayoutControl layout={layout} layoutChange={this.layoutChange} />
        </ListHeader>
        {layout === 'grid' ? (
          <Grid>
            {posts.map(p => (
              <GridItem key={p.id}>
                <Card {...p} onDelete={() => onDelete(p)} />
              </GridItem>
            ))}
          </Grid>
        ) : (
          <List>
            {posts.map(p => (
              <ListItemContainer key={p.id}>
                <PostListItem {...p} onDelete={() => onDelete(p)} />
              </ListItemContainer>
            ))}
          </List>
        )}
      </>
    );
  }
}
