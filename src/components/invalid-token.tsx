import * as React from "react";
import { Link } from "react-router-dom";

interface IInvalidTokenProps {
  error: string;
}

export default function InvalidToken(props: IInvalidTokenProps): JSX.Element {
  return (
    <div data-testid="INVALID_TOKEN_CONTAINER">
      <p>{props.error}</p>
      <Link to="/login">Let's sign in again.</Link>
    </div>
  );
}
