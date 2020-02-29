import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../pages/routes";

interface IInvalidTokenProps {
  error: string;
}

export default function InvalidToken(props: IInvalidTokenProps): JSX.Element {
  return (
    <div data-testid="INVALID_TOKEN_CONTAINER">
      <p>{props.error}</p>
      <Link to={Routes.LOGIN}>Let's sign in again.</Link>
    </div>
  );
}
