import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const PostsTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;

  @media (min-width: 57.75rem) {
    font-size: 18px;
  }
`;

const DeleteButton = styled.button`
  color: inherit;
  appearance: none;
  border: 0px;
  font-family: inherit;
  background: none;
`;

const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface IListItemProps {
  title: string;
  id: string;
  onDelete: (x: any) => void;
}

const ListItem: React.SFC<IListItemProps> = ({ title, id, onDelete }) => (
  <FlexBetween>
    <div>
      <PostsTitle>
        <Link
          prefetch
          href={{ pathname: '/edit', query: { id } }}
          as={`/${id}/edit`}>
          <a>{title}</a>
        </Link>
      </PostsTitle>
    </div>

    <DeleteButton onClick={onDelete}>
      <small>Delete</small>
    </DeleteButton>
  </FlexBetween>
);

export default ListItem;
