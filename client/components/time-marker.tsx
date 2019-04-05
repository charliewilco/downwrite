import * as React from "react";
import format from "date-fns/format";
import isDate from "date-fns/is_date";

interface ITimeMarkProps {
  dateAdded: Date;
}

function Time(props: ITimeMarkProps) {
  let date: string = isDate(props.dateAdded)
    ? props.dateAdded.toString()
    : undefined;
  return <time dateTime={date}>{format(props.dateAdded, "DD MMMM YYYY")}</time>;
}

export default function TimeMarker(props: ITimeMarkProps) {
  return (
    <div>
      Added on <Time dateAdded={props.dateAdded} />
      <style jsx>{`
        div {
          opacity: 0.5;
          font-size: small;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}
