import React from 'react'
import styled from 'styled-components'
import Link from 'react-router-dom/Link'

const PostsTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;

  @media (min-width: 57.75rem) {
    font-size: 24px;
  }
  @media (min-width: 75rem) {
    font-size: 36px;
  }
`

const DeleteButton = styled.button`
  appearance: none;
  border: 0px;
`

const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
`

const ListItem = ({ title, id, onDelete }) => (
  <FlexBetween>
    <div>
      <Link to={`/${id}/edit`}>
        <PostsTitle>{title}</PostsTitle>
      </Link>
    </div>

    <DeleteButton onClick={onDelete}>
      <small>Delete</small>
    </DeleteButton>
  </FlexBetween>
)

export default ListItem
