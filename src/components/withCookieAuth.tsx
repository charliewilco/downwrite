import is from "@sindresorhus/is";
import { NextPage } from "next";

export function withCookieAuth<Props>(Component: NextPage<Props>) {
  return (props: Props) => <Component {...props} gay />;
}
