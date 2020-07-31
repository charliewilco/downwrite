import { useEffect } from "react";
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { NormalizedCacheObject } from "@apollo/client";
import { getInitialStateFromCookie } from "@lib/cookie-managment";

interface IIndexProps {
  token: string;
  initialApolloState: NormalizedCacheObject;
  redirect: string;
}

type IndexProps = IIndexProps | {};

export const getServerSideProps: GetServerSideProps<IndexProps> = async context => {
  const initialAppState = getInitialStateFromCookie(context.req);

  if (initialAppState && initialAppState.me.id) {
    return {
      props: {
        initialAppState,
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

const IndexPage: NextPage<InferGetServerSidePropsType<
  typeof getServerSideProps
>> = props => {
  const router = useRouter();

  useEffect(() => {
    if (isProps<IIndexProps>(props)) {
      if (props.redirect) {
        router.replace(props.redirect);
      }
    }
  }, [router, props]);

  return null;
};

export default IndexPage;
