import * as React from "react";
import styled from "styled-components";
import format from "date-fns/format";
import isDate from "date-fns/is_date";

interface ITimeMarkProps {
  dateAdded: Date;
}

const Meta = styled.div`
  opacity: 0.5;
  font-size: small;
  margin-bottom: 8px;
`;

const Time: React.FC<ITimeMarkProps> = ({ dateAdded }) => {
  let date: string = isDate(dateAdded) ? dateAdded.toString() : undefined;
  return <time dateTime={date}>{format(dateAdded, "DD MMMM YYYY")}</time>;
};

const TimeMarker: React.FC<ITimeMarkProps> = ({ dateAdded }) => (
  <Meta>
    Added on <Time dateAdded={dateAdded} />
  </Meta>
);

export default TimeMarker;
