import Avatar from "./avatar";

interface IAuthorProps {
  name: string;
  colors: string[];
}

export default function Author(props: IAuthorProps): JSX.Element {
  return (
    <div className="border border-pixieblue-400 flex items-center">
      <Avatar colors={props.colors} />
      <h6 className="ml-4 text-base font-normal">{props.name}</h6>
    </div>
  );
}
