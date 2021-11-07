import { Avatar } from "./avatar";
import classNames from "@utils/classnames";
import { Gradient } from "@utils/default-styles";

interface IUserBlockProps {
  name: string;
  border: boolean;
  colors: Gradient;
}

export function UserBlock(props: IUserBlockProps): JSX.Element {
  return (
    <div
      className={classNames(
        "relative py-8 px-2",
        props.border && "border-b border-onyx-200",
        "text-center"
      )}>
      <Avatar centered colors={props.colors} />
      <b className="inline-block text-base">{props.name}</b>
    </div>
  );
}
