import * as React from "react";
import App, { Container, AppComponentProps, NextAppContext } from "next/app";
import isEmpty from "lodash/isEmpty";
import { UIShell } from "../components/ui-shell";
import { AuthProvider, AuthContext, IAuthContext } from "../components/auth";
import { cookies, ICookie } from "../utils/auth-middleware";

interface IAppProps extends AppComponentProps {
  token: string;
}

export default class Downwrite extends App<IAppProps> {
  public static async getInitialProps({ Component, ctx }: NextAppContext) {
    let pageProps = {};
    let { DW_TOKEN: token } = cookies<ICookie>(ctx) as ICookie;

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, token };
  }

  public render(): JSX.Element {
    const { Component, pageProps, token } = this.props;
    const authed = !isEmpty(token);
    return (
      <Container>
        <AuthProvider token={token} authed={authed}>
          <UIShell token={token}>
            <AuthContext.Consumer>
              {(auth: IAuthContext) => <Component {...pageProps} {...auth} />}
            </AuthContext.Consumer>
          </UIShell>
        </AuthProvider>
      </Container>
    );
  }
}
