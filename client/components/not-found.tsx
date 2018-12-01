import * as React from "react";
import styled from "../types/styled-components";

interface IPostError {
  message: string;
  error: string;
}

const ErrorContainer = styled.div`
  margin: 0 auto;
  padding: 8px;
  max-width: 512px;
  text-align: center;
  font-style: italic;
`;

const ErrorTitle = styled.h4`
  font-size: 20px;
  margin-bottom: 16px;
`;

const ErrorImage = styled.img`
  display: inline-block;
  margin-bottom: 16px;
  max-width: 25%;
`;

const PostError: React.SFC<IPostError> = ({ error, message }) => (
  <ErrorContainer>
    <ErrorImage
      alt="Document with an Negative mark"
      src="/static/entry-not-found.png"
    />
    <ErrorTitle>
      {error}. <br />
      Ummm... something went horribly wrong.
    </ErrorTitle>
    <p>{message}</p>
  </ErrorContainer>
);

export default PostError;
