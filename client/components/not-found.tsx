import * as React from "react";

interface IPostErrorProps {
  message: string;
  error: string;
}

export default function PostError({ error, message }: IPostErrorProps): JSX.Element {
  return (
    <div className="container">
      <img alt="Document with an Negative mark" src="/static/entry-not-found.png" />
      <h4>
        {error}. <br />
        Ummm... something went horribly wrong.
      </h4>
      <p>{message}</p>
      <style jsx>{`
        .container {
          margin: 0 auto;
          padding: 8px;
          max-width: 512px;
          text-align: center;
          font-style: italic;
        }

        h4 {
          font-size: 20px;
          margin-bottom: 16px;
        }

        img {
          display: inline-block;
          margin-bottom: 16px;
          max-width: 25%;
        }
      `}</style>
    </div>
  );
}
