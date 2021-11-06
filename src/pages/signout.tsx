import { useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const [, { onCurrentUserLogout }] = useCurrentUser();

  useEffect(() => {
    onCurrentUserLogout();
    router.push(Routes.LOGIN);
  }, [router]);

  return <h1>Signing out...</h1>;
};

export default SignOut;
