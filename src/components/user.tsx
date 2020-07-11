import Avatar from "./avatar";
import classNames from "../utils/classnames";

interface IUserBlockProps {
  name: string;
  border: boolean;
  colors: string[];
}

export default function UserBlock(props: IUserBlockProps): JSX.Element {
  return (
    <div
      className={classNames(
        "relative py-8 px-2",
        props.border && "border-b-2 border-onyx-200",
        "text-center"
      )}>
      <Avatar centered colors={props.colors} />
      <b className="inline-block text-base">{props.name}</b>
    </div>
  );
}
