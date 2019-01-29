import * as React from "react";
import styled from "styled-components";
import Link from "next/link";
import distance from "date-fns/distance_in_words_to_now";

import { PreviewLink } from "./card";

const PostsTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;

  @media (min-width: 57.75rem) {
    font-size: 18px;
  }
`;

const Container = styled.div`
  padding: 16px 0;

  display: flex;
  justify-content: space-between;
  align-items: center;

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
  margin-left: 16px;
  display: inline-block;
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

const ListItem: React.FC<IListItemProps> = props => (
  <Container>
    <div>
      <PostsTitle>
        <Link prefetch href={{ pathname: "/edit", query: { id: props.id } }}>
          <a>{props.title}</a>
        </Link>

        {props.public && (
          <Tray>
            <PreviewLink id={props.id} />
          </Tray>
        )}
      </PostsTitle>
      <Meta>added {distance(props.dateAdded)} ago</Meta>
    </div>
    {props.onDelete && <DeleteButton onClick={props.onDelete}>Delete</DeleteButton>}
  </Container>
);

export default ListItem;
