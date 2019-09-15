import * as React from "react";
import Head from "next/head";
import NotFound from "../components/not-found";
import { NextPageContext } from "next";

interface IErrorViewProps {
  statusCode: number;
}

interface ICustomError extends Error {
  statusCode: number;
}

interface IErrorPageContext extends NextPageContext {
  err: ICustomError;
}

function StatusCode(props: Partial<ICustomError>) {
  return (
    <p>
      {props.statusCode
        ? "An error " + props.statusCode + "occurred on server"
        : "An error occurred on client"}
    </p>
  );
}

function ErrorPage(props: IErrorViewProps) {
  return (
    <section
      className="Wrapper u-center"
      style={{
        paddingTop: 128,
        paddingBottom: 128,
        paddingLeft: 16,
        paddingRight: 16
      }}>
      <Head>
        <title>Not Found | Downwrite</title>
      </Head>
      <h2 className="SuperErrorMessage">404</h2>
      <StatusCode statusCode={props.statusCode} />
      <NotFound
        error={null}
        message={
          props.statusCode
            ? "An error " + props.statusCode + "occurred on server"
            : "An error occurred on client"
        }
      />
    </section>
  );
}

ErrorPage.getInitialProps = function({ res, err }: IErrorPageContext) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : null;
  return { statusCode };
};

export default ErrorPage;
