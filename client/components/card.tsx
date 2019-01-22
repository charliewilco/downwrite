import * as React from "react";
import * as Draft from "draft-js";
import styled from "styled-components";
import Link from "next/link";
import * as distance from "date-fns/distance_in_words_to_now";
import * as DefaultStyles from "../utils/defaultStyles";

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-weight: 400;
  padding: 8px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background: ${props => props.theme.cardBackground};

  a {
    cursor: pointer;
  }
`;

const CardTitle = styled.h2`
  font-size: 14px;
  margin-bottom: 0px;
  font-weight: 700;

  @media (min-width: 57.75rem) {
    font-size: 18px;
  }
`;

const CardHeader = styled.header`
  display: block;
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 0 0 12px;
  margin-bottom: 42px;
`;

const CardMeta = styled.small`
  font-size: 12px;
  display: block;
  color: ${props => props.theme.meta};
  font-weight: 400;
`;

const CardTray = styled.footer`
  display: flex;
  font-weight: 700;
  font-size: 12px;
  justify-content: space-between;

  & a:hover {
    color: ${DefaultStyles.colors.blue500};
  }
`;

const CardDelete = styled.button`
  color: ${props => props.theme.cardDeleteButton};
  border: 0px;
  background: none;
  appearance: none;
  font-family: inherit;
  box-sizing: inherit;
  font-size: 12px;
  -webkit-font-smoothing: antialiased;
`;

const SxLink = styled.a`
  margin-right: 8px;
`;

interface ICardLinks {
  id: string;
  title?: string;
}

export const EditLink: React.SFC<ICardLinks> = ({ id, title = "Edit" }) => (
  <Link prefetch passHref href={{ pathname: "/edit", query: { id } }}>
    <SxLink>{title}</SxLink>
  </Link>
);

export const PreviewLink: React.SFC<ICardLinks> = ({ id }) => (
  <Link prefetch passHref href={{ pathname: "/preview", query: { id } }}>
    <SxLink>Preview</SxLink>
  </Link>
);

export interface ICardProps {
  title: string;
  content: Draft.RawDraftContentState;
  excerpt?: string;
  id: string;
  dateAdded: Date;
  onDelete: () => void;
  public: boolean;
}

const Card: React.SFC<ICardProps> = ({
  title,
  id,
  content,
  dateAdded,
  onDelete,
  public: publicStatus
}) => (
  <CardContainer data-testid="CARD">
    <CardHeader>
      <CardTitle data-testid="CARD_TITLE">
        <EditLink title={title} id={id} />
      </CardTitle>
      <CardMeta>added {distance(dateAdded)} ago</CardMeta>
    </CardHeader>
    <CardTray>
      <div data-testid="CARD_EXCERPT">
        <EditLink id={id} />
        {publicStatus && <PreviewLink id={id} />}
      </div>
      {onDelete && (
        <CardDelete data-testid="CARD_DELETE_BUTTON" onClick={onDelete}>
          Delete
        </CardDelete>
      )}
    </CardTray>
  </CardContainer>
);

export default Card;
