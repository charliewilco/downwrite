import * as React from "react";

interface IPostErrorProps {
  message: string;
  error: string;
}

export default function PostError({ error, message }: IPostErrorProps): JSX.Element {
  return (
    <div className="NotFound Wrapper Wrapper--sm u-center">
      <img
        className="NotFoundImage"
        alt="Document with an Negative mark"
        src="/static/entry-not-found.png"
      />
      <h4 className="NotFoundTitle">
        {error}. <br />
        Ummm... something went horribly wrong.
      </h4>
      <p>{message}</p>
    </div>
  );
}
