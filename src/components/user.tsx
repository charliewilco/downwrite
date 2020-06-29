import Avatar from "./avatar";
import classNames from "../utils/classnames";

interface IUserBlockProps {
  name: string;
  border: boolean;
  colors: string[];
}

export default function UserBlock(props: IUserBlockProps): JSX.Element {
  const className = classNames("User", props.border && "User--border", "u-center");

  return (
    <div className={className}>
      <Avatar centered colors={props.colors} />
      <span className="UserName">{props.name}</span>
    </div>
  );
}
