import * as React from 'react';
import styled from 'styled-components';
import format from 'date-fns/format';

interface ITimeMarkProps {
  dateAdded: Date | string;
}

const Meta = styled.div`
  opacity: 0.5;
  font-size: small;
  margin-bottom: 8px;
`;

const Time: React.SFC<ITimeMarkProps> = ({ dateAdded }) => (
  <time dateTime={dateAdded.toString()}>{format(dateAdded, 'DD MMMM YYYY')}</time>
);

const TimeMarker: React.SFC<ITimeMarkProps> = ({ dateAdded }) => (
  <Meta>
    Added on <Time dateAdded={dateAdded} />
  </Meta>
);

export default TimeMarker;
