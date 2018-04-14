import React from 'react'
import styled from 'styled-components'
import Link from 'react-router-dom/Link'
import distance from 'date-fns/distance_in_words_to_now'

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 192px;
  font-weight: 400;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background-color: white;
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
  border-bottom: 1px solid #dbdcdd;
  padding: 12px 8px;
`

const CardMeta = styled.small`
  font-size: 12px;
  display: block;
  color: #757575;
  font-weight: 400;
`

const CardTray = styled.footer`
  display: flex;
  padding: 8px;
  font-weight: 700;
  font-size: 12px;
  justify-content: space-between;
  background-color: rgba(101, 163, 191, 0.125);

  & a: {
    color: '#4382A1';
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
  color: var(--color-2);
  border: 0px;
  background: none;
  appearance: none;
  -webkit-font-smoothing: antialiased;
`

const SxLink = styled(Link)`
  margin-right: 8px;
`

const Card = ({ title, id, content, dateAdded, onDelete, ...args }) => (
  <CardContainer data-test="Card">
    <CardHeader>
      <CardTitle>
        <Link to={`/${id}/edit`}>{title}</Link>
      </CardTitle>
      <CardMeta>added {distance(dateAdded)} ago</CardMeta>
    </CardHeader>

    <CardBody>
      {content && (
        <CardPreview data-test="snippet">{content.blocks[0].text.substr(0, 75)}</CardPreview>
      )}
    </CardBody>
    <CardTray>
      <div>
        <SxLink to={`/${id}/edit`}>Edit</SxLink>
        {args.public && <Link to={`/${id}/preview`}>Preview</Link>}
      </div>
      {onDelete && (
        <CardDelete data-test="cardDelete" onClick={onDelete}>
          Delete
        </CardDelete>
      )}
    </CardTray>
  </CardContainer>
)

export default Card
