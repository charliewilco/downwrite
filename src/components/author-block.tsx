import { Avatar } from "./avatar";
import { Gradient } from "@utils/default-styles";

interface IAuthorProps {
  name: string;
  colors: Gradient;
}

export const AuthorBlock = (props: IAuthorProps): JSX.Element => {
  return (
    <div>
      <Avatar colors={props.colors} />
      <h6>{props.name}</h6>

      <style jsx>{`
        h6 {
          margin-left: 1rem;
        }

        div {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
