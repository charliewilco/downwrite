import React, { Fragment } from 'react'
import styled from 'styled-components'
import Card from './Card'
import LayoutControl from './LayoutControl'
import ListItem from './PostListItem'

const Title = styled.h1`
  font-weight: 500;
  font-size: 18px;

  @media (min-width: 57.75rem) {
    font-size: 24px;
  }
`

const Grid = styled.ul`
  list-style: none inside;
  display: flex;
  flex-wrap: wrap;
  @media (min-width: 48rem) {
    margin-left: -20px;
  }
`

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
`

const ListHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const ListItemContainer = styled.li`
  padding: 16px 0;
  width: 100%;
  flex: 1;

  &:not(:last-of-type) {
    border-bottom: 1px solid #ccc;
  }
`

const List = styled.ul`
  list-style: inside none;
`

export default ({ posts, layout, layoutChange, onDelete }) => (
  <Fragment>
    <ListHeader>
      <Title>Entries</Title>
      <LayoutControl layout={layout} layoutChange={layoutChange} />
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
            <ListItem {...p} onDelete={() => onDelete(p)} />
          </ListItemContainer>
        ))}
      </List>
    )}
  </Fragment>
)
