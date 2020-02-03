import * as React from "react";
import Head from "react-helmet";
import { ApolloError } from "apollo-client";

import Loading from "./loading";
import InvalidToken from "./invalid-token";

export const LoadingDashboard = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Loading | Downwrite</title>
      </Head>
      <Loading size={100} />
    </React.Fragment>
  );
};

interface IErrorDashboard {
  error: ApolloError;
}

export const ErrorDashboard = (props: IErrorDashboard) => {
  return (
    <React.Fragment>
      <Head>
        <title>Error | Downwrite</title>
      </Head>
      <InvalidToken error={props.error.message} />
    </React.Fragment>
  );
};
