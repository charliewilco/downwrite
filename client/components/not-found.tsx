import * as React from "react";

interface IPostError {
  message: string;
  error: string;
}

const PostError: React.FC<IPostError> = ({ error, message }) => (
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

export default PostError;
