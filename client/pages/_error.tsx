import * as React from "react";
import Head from "next/head";
import styled from "styled-components";
import Wrapper from "../components/wrapper";
import NotFound from "../components/not-found";
import { NextContext } from "next";

const CenteredWrapper = styled(Wrapper)`
  text-align: center;
  padding: 8rem 1rem;
`;

const ErrorTitle = styled.h2`
  display: inline-block;
  margin-bottom: 32px;
  font-size: 84px;
  line-height: 1;
  font-weight: 900;
`;

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

export default class ErrorPage extends React.Component<IErrorViewProps, any> {
  public static getInitialProps({ res, err }: IErrorPageContext) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode };
  }

  public render(): JSX.Element {
    const { statusCode } = this.props;
    return (
      <CenteredWrapper>
        <Head>
          <title>Not Found | Downwrite</title>
        </Head>
        <ErrorTitle>404</ErrorTitle>
        <StatusCode statusCode={statusCode} />
        <NotFound
          error={null}
          message={
            statusCode
              ? "An error " + statusCode + "occurred on server"
              : "An error occurred on client"
          }
        />
      </CenteredWrapper>
    );
  }
}
