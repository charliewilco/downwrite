import { GetServerSideProps } from "next";
import { removeTokenCookie } from "../lib/cookie-managment";
import { IAppState } from "../atoms";

export const getServerSideProps: GetServerSideProps<
  { token: "" } & Partial<IAppState>,
  any
> = async context => {
  removeTokenCookie(context.res);
  context.res.setHeader("location", "/login");
  context.res.statusCode = 302;
  context.res.end();

  return {
    props: {
      token: ""
    }
  };
};

export default function SignOut() {
  return <h1>Goodbye!</h1>;
}
