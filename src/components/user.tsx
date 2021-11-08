import { Avatar } from "./avatar";
import { Gradient } from "@utils/default-styles";

interface IUserBlockProps {
  name: string;
  border: boolean;
  colors: Gradient;
}

export function UserBlock(props: IUserBlockProps): JSX.Element {
  return (
    <div>
      <Avatar centered colors={props.colors} />
      <b>{props.name}</b>
      <style jsx>
        {`
          div {
            padding: 2rem 0.5rem;
            max-width: 100%;
            position: relative;
            text-align: center;
            border-bottom: ${props.border ? "1px" : 0} solid var(--onyx-200);
          }
          b {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}
      </style>
    </div>
  );
}
