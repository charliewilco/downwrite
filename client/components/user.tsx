import * as React from "react";
import Avatar from "./avatar";

interface IUserBlockProps {
  name: string;
  border: boolean;
  colors: string[];
}

export default function UserBlock(props: IUserBlockProps): JSX.Element {
  return (
    <div className={"border" in props && "border"}>
      <Avatar centered colors={props.colors} />
      <span className="user-block-name">{props.name}</span>
      <style jsx>{`
        div {
          position: relative;
          text-align: center;
          padding: 32px 8px;
        }

        span {
          display: inline-block;
          font-size: 16px;
          font-weight: 700;
        }

        .border {
          border-bottom: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
