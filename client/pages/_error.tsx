import * as React from "react";
import Head from "next/head";
import NotFound from "../components/not-found";
import { NextContext } from "next";

interface IErrorViewProps {
  statusCode: number;
}

interface CustomError extends Error {
  statusCode: number;
}

interface IErrorPageContext extends NextContext<any> {
  err: CustomError;
}

const StatusCode: React.FC<Partial<CustomError>> = props => (
  <p>
    {props.statusCode
      ? "An error " + props.statusCode + "occurred on server"
      : "An error occurred on client"}
  </p>
);

function ErrorPage(props: IErrorViewProps) {
  return (
    <section className="centered-wrapper">
      <Head>
        <title>Not Found | Downwrite</title>
      </Head>
      <h2>404</h2>
      <StatusCode statusCode={props.statusCode} />
      <NotFound
        error={null}
        message={
          props.statusCode
            ? "An error " + props.statusCode + "occurred on server"
            : "An error occurred on client"
        }
      />
      <style jsx>{`
        h2 {
          display: inline-block;
          margin-bottom: 32px;
          font-size: 84px;
          line-height: 1;
          font-weight: 900;
        }

        .centered-wrapper {
          text-align: center;
          padding: 8rem 1rem;
          margin-left: auto;
          margin-right: auto;
          max-width: 1088px;
        }
      `}</style>
    </section>
  );
}

ErrorPage.getInitialProps = function({ res, err }: IErrorPageContext) {
  const statusCode = res ? res.statusCode : err ? err.statusCode : null;
  return { statusCode };
};

export default ErrorPage;
