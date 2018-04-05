import React, { Fragment } from 'react'
import Media from 'react-media'
import Link from 'react-router-dom/Link'
import styled from 'styled-components'
import Card from './Card'

const SidebarEntriesTitle = styled.h6`
  font-size: 12px;
  margin-bottom: 8px;
`

const Separator = styled.div`
  margin-bottom: 1rem;
`

export default ({ matches, posts }) => (
  <Media query={{ minWidth: 500 }}>
    {matches => (
      <Fragment>
        <SidebarEntriesTitle>Recent Entries</SidebarEntriesTitle>

        {posts.slice(0, 2).map((post, i) => (
          <Separator key={i}>
            {matches ? (
              <Card {...post} />
            ) : (
              <Link to={`/${post.id}/edit`} className="small">
                {post.title}
              </Link>
            )}
          </Separator>
        ))}
      </Fragment>
    )}
  </Media>
)
