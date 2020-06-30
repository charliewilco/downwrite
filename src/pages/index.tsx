import { useEffect } from "react";
import { useAuthContext } from "../components/auth";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { parseCookies } from "../lib/cookie-managment";
// import { initializeApollo } from "../lib/apollo";

export default function IndexPage() {
  const [{ authed }] = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    router.replace(authed ? "/dashboard" : "/login");
  }, [router, authed]);

  return null;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { DW_TOKEN } = parseCookies(context.req);

  if (DW_TOKEN) {
    return {
      props: {
        token: DW_TOKEN,
        initialApolloState: {}
      }
    };
  } else {
    context.res.setHeader("location", "/login");
    context.res.statusCode = 302;
    context.res.end();
    return { props: {} };
  }
};
