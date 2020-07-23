import Avatar from "./avatar";
import { Gradient } from "@utils/default-styles";

interface IAuthorProps {
  name: string;
  colors: Gradient;
}

export default function Author(props: IAuthorProps): JSX.Element {
  return (
    <div className="flex items-center">
      <Avatar colors={props.colors} />
      <h6 className="ml-4 text-base font-normal">{props.name}</h6>
    </div>
  );
}
