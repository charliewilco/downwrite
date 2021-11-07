import { useEffect } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { removeTokenCookie } from "@lib/cookie-managment";
import { Routes } from "@utils/routes";
import { useStore } from "@store/provider";

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  removeTokenCookie(context.res);
  return {
    props: {}
  };
};

const SignOut: NextPage = () => {
  const router = useRouter();
  const store = useStore();

  useEffect(() => {
    store.me.onLogout();
    router.push(Routes.LOGIN);
  }, [router]);

  return <h1>Signing out...</h1>;
};

export default SignOut;
