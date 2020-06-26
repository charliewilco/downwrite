import { Fragment } from "react";
import Head from "next/head";
import { ApolloError } from "@apollo/client";

import Loading from "./loading";
import InvalidToken from "./invalid-token";

export const LoadingDashboard = () => {
  return (
    <Fragment>
      <Head>
        <title>Loading | Downwrite</title>
      </Head>
      <Loading size={100} />
    </Fragment>
  );
};

interface IErrorDashboard {
  error: ApolloError;
}

export const ErrorDashboard = (props: IErrorDashboard) => {
  return (
    <Fragment>
      <Head>
        <title>Error | Downwrite</title>
      </Head>
      <InvalidToken error={props.error.message} />
    </Fragment>
  );
};
