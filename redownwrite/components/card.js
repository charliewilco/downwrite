import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import distance from 'date-fns/distance_in_words_to_now'
import { colors } from '../utils/defaultStyles'

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 192px;
  font-weight: 400;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background-color: ${props => props.theme.cardBackground};

  a {
    cursor: pointer;
  }
`

const CardTitle = styled.h2`
  font-size: 14px;
  margin-bottom: 0px;
  font-weight: 700;

  @media (min-width: 57.75rem) {
    font-size: 18px;
  }
`

const CardHeader = styled.header`
  display: block;
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 12px 8px;
`

const CardMeta = styled.small`
  font-size: 12px;
  display: block;
  color: ${props => props.theme.meta};
  font-weight: 400;
`

const CardTray = styled.footer`
  display: flex;
  padding: 8px;
  font-weight: 700;
  font-size: 12px;
  justify-content: space-between;
  background-color: ${props => props.theme.cardTrayBackground};

  & a:hover {
    color: ${colors.blue500};
  }
`

const CardPreview = styled.p`
  font-size: 12px;
`

const CardBody = styled.div`
  display: block;
  padding: 0.5rem;
  flex: 1;
  overflow: hidden;
`

const CardDelete = styled.button`
  color: ${colors.blue700};
  border: 0px;
  background: none;
  appearance: none;
  font-family: inherit;
  box-sizing: inherit;
  font-size: 12px;
  -webkit-font-smoothing: antialiased;
`

const SxLink = styled.a`
  margin-right: 8px;
`

const EditLink = ({ id, title = 'Edit' }) => (
  <Link
    prefetch
    passHref
    href={{ pathname: '/edit', query: { id } }}
    as={`/${id}/edit`}>
    <SxLink>{title}</SxLink>
  </Link>
)

const PreviewLink = ({ id }) => (
  <Link
    prefetch
    href={{ pathname: '/preview', query: { id } }}
    as={`/${id}/preview`}>
    <SxLink>Preview</SxLink>
  </Link>
)

const Card = ({ title, id, content, dateAdded, onDelete, ...args }) => (
  <CardContainer data-testid="CARD">
    <CardHeader>
      <CardTitle data-testid="CARD_TITLE">
        <EditLink title={title} id={id} />
      </CardTitle>
      <CardMeta>added {distance(dateAdded)} ago</CardMeta>
    </CardHeader>

    <CardBody>
      {content && (
        <CardPreview data-testid="snippet">
          {content.blocks[0].text.substr(0, 75)}
        </CardPreview>
      )}
    </CardBody>
    <CardTray>
      <div data-testid="CARD_EXCERPT">
        <EditLink id={id} />
        {args.public && <PreviewLink id={id} />}
      </div>
      {onDelete && (
        <CardDelete data-testid="CARD_DELETE_BUTTON" onClick={onDelete}>
          Delete
        </CardDelete>
      )}
    </CardTray>
  </CardContainer>
)

export default Card
