import App, { Container } from 'next/app';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { getToken } from '../utils/responseHandler';
import UIShell from '../components/ui-shell';
import AuthMegaProvider, { withAuth } from '../components/auth';
import { withErrors } from '../components/ui-error';

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    let { token } = getToken(ctx.req, ctx.query);

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, router, token };
  }

  render() {
    const {
      Component,
      pageProps,
      token,
      router: { route }
    } = this.props;
    const authed = !isEmpty(token);
    const Cx = withAuth(withErrors(Component));
    return (
      <Container>
        <AuthMegaProvider token={token} authed={authed}>
          <UIShell route={route} token={token}>
            <Cx {...pageProps} route={route} />
          </UIShell>
        </AuthMegaProvider>
      </Container>
    );
  }
}
