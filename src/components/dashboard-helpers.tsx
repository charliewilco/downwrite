import Head from "next/head";
import { ApolloError } from "@apollo/client";

import Loading from "./loading";
import InvalidToken from "./invalid-token";

export const LoadingDashboard = () => {
  return (
    <>
      <Head>
        <title>Loading | Downwrite</title>
      </Head>
      <Loading size={100} />
    </>
  );
};

interface IErrorDashboard {
  error: ApolloError;
}

export const ErrorDashboard = (props: IErrorDashboard) => {
  return (
    <>
      <Head>
        <title>Error | Downwrite</title>
      </Head>
      <InvalidToken error={props.error.message} />
    </>
  );
};
