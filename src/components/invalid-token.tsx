import * as React from "react";
import Link from "next/link";

interface IInvalidTokenProps {
  error: string;
}

export default function InvalidToken(props: IInvalidTokenProps): JSX.Element {
  return (
    <div data-testid="INVALID_TOKEN_CONTAINER">
      <p>{props.error}</p>
      <Link href="/login">
        <a>Let's sign in again.</a>
      </Link>
    </div>
  );
}
