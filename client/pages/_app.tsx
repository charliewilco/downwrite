import App, { Container, AppComponentProps } from "next/app";
import React from "react";
import isEmpty from "lodash/isEmpty";
import { getToken } from "../utils/responseHandler";
import UIShell from "../components/ui-shell";
import AuthMegaProvider, { AuthConsumer } from "../components/auth";

export default class Downwrite extends App<AppComponentProps & { token: string }> {
  static async getInitialProps({ Component, router, ctx }) {
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
