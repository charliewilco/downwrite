import { useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { removeTokenCookie } from "@lib/cookie-managment";
import { Routes } from "@utils/routes";

export const getServerSideProps: GetServerSideProps<{ token: "" }, any> = async (
  context
) => {
  removeTokenCookie(context.res);
  return {
    props: {
      token: ""
    }
  };
};

const SignOut: NextPage = () => {
  const client = useApolloClient();
  const router = useRouter();

  useEffect(() => {
    client.resetStore().then(() => {
      router.push(Routes.LOGIN);
    });
  }, [router, client]);

  return <h1>Signing out...</h1>;
};

export default SignOut;
