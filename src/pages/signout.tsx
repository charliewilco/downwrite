import { GetServerSideProps, NextPage } from "next";
import { removeTokenCookie } from "@lib/cookie-managment";

export const getServerSideProps: GetServerSideProps<{ token: "" }, any> = async (
  context
) => {
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

const SignOut: NextPage = () => {
  return <h1>Goodbye!</h1>;
};

export default SignOut;
