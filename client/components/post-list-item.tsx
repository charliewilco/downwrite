import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import distance from "date-fns/distance_in_words_to_now";

import { PreviewLink, EditLink } from "./card";

const PostsTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;

  @media (min-width: 57.75rem) {
    font-size: 18px;
  }
`;

const Container = styled.div`
  padding: 16px 0;

  &:not(:last-of-type) {
    border-bottom: 1px solid #ccc;
  }
`;

const DeleteButton = styled.button`
  color: inherit;
  appearance: none;
  border: 0px;
  font-family: inherit;
  background: none;
`;

const Tray = styled.div`
  font-size: 12px;
`;

const Meta = styled.small`
  font-size: 12px;
  display: block;
  color: ${props => props.theme.meta};
  font-weight: 400;
  margin-bottom: 8px;
`;

interface IListItemProps {
  title: string;
  content: Draft.RawDraftContentState;
  id: string;
  dateAdded: Date;
  onDelete: (x: any) => void;
  public: boolean;
}

const ListItem: React.SFC<IListItemProps> = ({
  public: publicStatus,
  title,
  dateAdded,
  id,
  onDelete
}) => (
  <Container>
    <PostsTitle>
      <Link prefetch href={{ pathname: "/edit", query: { id } }}>
        <a>{title}</a>
      </Link>
    </PostsTitle>
    <Meta>added {distance(dateAdded)} ago</Meta>
    <Tray>
      <EditLink id={id} />
      {publicStatus && <PreviewLink id={id} />}
      {onDelete && <DeleteButton onClick={onDelete}>Delete</DeleteButton>}
    </Tray>
  </Container>
);

export default ListItem;
