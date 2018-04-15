import React from 'react'
import styled from 'styled-components'
import format from 'date-fns/format'

const Meta = styled.div`
  opacity: 0.5;
  font-size: small;
  margin-bottom: 8px;
`

const Time = ({ dateAdded }) => (
  <time dateTime={dateAdded}>{format(dateAdded, 'DD MMMM YYYY')}</time>
)

export default ({ dateAdded }) => (
  <Meta>
    Added on <Time dateAdded={dateAdded} />
  </Meta>
)
