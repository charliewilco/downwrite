import Link from "next/link";
import { Routes } from "@utils/routes";

interface IInvalidTokenProps {
  error: string;
}

export function InvalidToken(props: IInvalidTokenProps): JSX.Element {
  return (
    <div data-testid="INVALID_TOKEN_CONTAINER">
      <p>{props.error}</p>
      <Link href={Routes.LOGIN} passHref>
        <a>Let's sign in again.</a>
      </Link>
    </div>
  );
}
