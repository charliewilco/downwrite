import { useEffect } from "react";
import { NormalizedCacheObject } from "@apollo/client";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { parseCookies } from "../lib/cookie-managment";
// import { initializeApollo } from "../lib/apollo";

interface IIndexProps {
  token: string;
  initialApolloState: NormalizedCacheObject;
  redirect: string;
}
type IndexProps = IIndexProps | {};

export const getServerSideProps: GetServerSideProps<IndexProps> = async context => {
  const { DW_TOKEN } = parseCookies(context.req);

  if (DW_TOKEN) {
    console.log("TOKEN", DW_TOKEN);
    return {
      props: {
        token: DW_TOKEN,
        initialApolloState: {},
        redirect: "/dashboard"
      }
    };
  } else {
    context.res.setHeader("location", "/login");
    context.res.statusCode = 302;
    context.res.end();
    return { props: {} };
  }
};

export default function IndexPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();

  useEffect(() => {
    if (!!props && props !== {}) {
      if ((props as IIndexProps).redirect) {
        router.replace((props as IIndexProps).redirect);
      }
    }
  }, [router, props]);

  return null;
}
