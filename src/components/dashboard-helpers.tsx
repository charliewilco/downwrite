import Head from "next/head";

import Loading from "./loading";
import InvalidToken from "./invalid-token";

export const LoadingDashboard = () => {
  return (
    <>
      <Head>
        <title>Loading | Downwrite</title>
      </Head>
      <Loading />
    </>
  );
};

interface IErrorDashboard {
  error: Error;
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
