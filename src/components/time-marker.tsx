import format from "date-fns/format";

interface ITimeMarkProps {
  dateAdded: Date;
}

export function TimeMarker(props: ITimeMarkProps) {
  const date = new Date(props.dateAdded.toString());

  return (
    <div className="opacity-50 text-xs mb-2">
      Added on <time dateTime={date.toString()}>{format(date, "dd MMMM yyyy")}</time>
    </div>
  );
}
