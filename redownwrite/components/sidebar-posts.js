import React, { Fragment } from 'react'
import styled from 'styled-components'
import Media from 'react-media'
import Card from './card'
import PostListItem from './post-list-item'

const SidebarEntriesTitle = styled.h6`
  font-size: 12px;
  margin-bottom: 8px;
`

const Separator = styled.div`
  margin-bottom: 1rem;
`

export default ({ posts }) => (
  <Media query={{ minWidth: 500 }}>
    {matches => (
      <Fragment>
        <SidebarEntriesTitle>Recent Entries</SidebarEntriesTitle>

        {posts
          .slice(0, 2)
          .map((post, i) => (
            <Separator key={i}>
              {matches ? <Card {...post} /> : <PostListItem {...post} />}
            </Separator>
          ))}
      </Fragment>
    )}
  </Media>
)
