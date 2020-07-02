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

const isProps = <K extends any>(props: any): props is K => {
  return !!props && props !== {};
};

export default function IndexPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();

  useEffect(() => {
    console.log("REDIRECT");
    if (isProps<IIndexProps>(props)) {
      if (props.redirect) {
        router.replace(props.redirect);
      }
    }
  }, [router, props]);

  return null;
}
