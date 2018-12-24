import * as React from "react";
import Link from "next/link";

interface IInvalidTokenProps {
  error: string;
}

export default class extends React.Component<IInvalidTokenProps, any> {
  render() {
    return (
      <div data-testid="INVALID_TOKEN_CONTAINER">
        <p>{this.props.error}</p>
        <Link href="/login">
          <a>Let's sign in again.</a>
        </Link>
      </div>
    );
  }
}
