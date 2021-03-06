import format from "date-fns/format";

interface ITimeMarkProps {
  dateAdded: Date;
}

function Time(props: ITimeMarkProps) {
  const date = new Date(props.dateAdded.toString());

  return <time dateTime={date.toString()}>{format(date, "dd MMMM yyyy")}</time>;
}

export default function TimeMarker(props: ITimeMarkProps) {
  return (
    <div className="opacity-50 text-xs mb-2">
      Added on <Time dateAdded={props.dateAdded} />
    </div>
  );
}
