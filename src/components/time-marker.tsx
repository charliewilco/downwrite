import format from "date-fns/format";

interface ITimeMarkProps {
  dateAdded: Date;
}

export const TimeMarker: React.VFC<ITimeMarkProps> = (props) => {
  const date = new Date(props.dateAdded.toString());

  return (
    <div>
      Added on <time dateTime={date.toString()}>{format(date, "dd	LLL yy")}</time>
    </div>
  );
};
