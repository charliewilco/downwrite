import * as React from "react";
import { Helmet } from "react-helmet-async";
import { ApolloError } from "apollo-client";

import Loading from "./loading";
import InvalidToken from "./invalid-token";

export const LoadingDashboard = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>Loading | Downwrite</title>
      </Helmet>
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
      <Helmet>
        <title>Error | Downwrite</title>
      </Helmet>
      <InvalidToken error={props.error.message} />
    </React.Fragment>
  );
};
