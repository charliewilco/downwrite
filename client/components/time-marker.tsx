import * as React from "react";
import format from "date-fns/format";
import isDate from "date-fns/isDate";

interface ITimeMarkProps {
  dateAdded: Date;
}

function Time(props: ITimeMarkProps) {
  let date: string = isDate(props.dateAdded)
    ? props.dateAdded.toString()
    : undefined;
  return <time dateTime={date}>{format(props.dateAdded, "dd MMMM yyyy")}</time>;
}

export default function TimeMarker(props: ITimeMarkProps) {
  return (
    <div className="TimeMarker">
      Added on <Time dateAdded={props.dateAdded} />
    </div>
  );
}
