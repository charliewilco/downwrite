import { useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { removeTokenCookie } from "@lib/cookie-managment";
import { Routes } from "@utils/routes";
import { IAppState, initialState, useCurrentUser } from "@reducers/app";

export const getServerSideProps: GetServerSideProps<
  { initialAppState: IAppState },
  any
> = async (context) => {
  removeTokenCookie(context.res);
  return {
    props: {
      initialAppState: initialState
    }
  };
};

const SignOut: NextPage = () => {
  const client = useApolloClient();
  const router = useRouter();
  const [, { onCurrentUserLogout }] = useCurrentUser();

  useEffect(() => {
    onCurrentUserLogout();
    client.resetStore().then(() => {
      router.push(Routes.LOGIN);
    });
  }, [router, client]);

  return <h1>Signing out...</h1>;
};

export default SignOut;
