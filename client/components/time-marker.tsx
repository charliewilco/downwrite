import * as React from "react";
import styled from "styled-components";
import format from "date-fns/format";
import isDate from "date-fns/is_date";
import { fonts } from "../utils/defaultStyles";

interface ITimeMarkProps {
  dateAdded: Date;
}

const Meta = styled.div`
  opacity: 0.5;
  font-family: ${fonts.sans};
  font-size: small;
  margin-bottom: 8px;
`;

const Time: React.SFC<ITimeMarkProps> = ({ dateAdded }) => {
  let date: string = isDate(dateAdded) ? dateAdded.toString() : undefined;
  return <time dateTime={date}>{format(dateAdded, "DD MMMM YYYY")}</time>;
};

const TimeMarker: React.SFC<ITimeMarkProps> = ({ dateAdded }) => (
  <Meta>
    Added on <Time dateAdded={dateAdded} />
  </Meta>
);

export default TimeMarker;
