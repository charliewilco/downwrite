import App, { Container, AppComponentProps, NextAppContext } from "next/app";
import React from "react";
import isEmpty from "lodash/isEmpty";
import { getToken } from "../utils/responseHandler";
import { UIShell } from "../components/ui-shell";
import AuthMegaProvider, { AuthConsumer } from "../components/auth";

interface IAppProps extends AppComponentProps {
  token: string;
}

export default class Downwrite extends App<IAppProps> {
  static async getInitialProps({ Component, ctx }: NextAppContext) {
    let pageProps = {};

    let { token } = getToken(ctx.req, ctx.query);

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, token };
  }

  render() {
    const { Component, pageProps, token } = this.props;
    const authed = !isEmpty(token);
    return (
      <Container>
        <AuthMegaProvider token={token} authed={authed}>
          <UIShell token={token}>
            <AuthConsumer>
              {auth => <Component {...pageProps} {...auth} />}
            </AuthConsumer>
          </UIShell>
        </AuthMegaProvider>
      </Container>
    );
  }
}
