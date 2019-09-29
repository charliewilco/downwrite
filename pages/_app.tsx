import * as React from "react";
import App, { AppProps, AppContext } from "next/app";
import isEmpty from "lodash/isEmpty";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import { cookies, ICookie } from "../utils/auth-middleware";

interface IAppProps extends AppProps {
  token: string;
}

export default class Downwrite extends App<IAppProps> {
  public static async getInitialProps({ Component, ctx, ...props }: AppContext) {
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
      <AuthProvider token={token} authed={authed}>
        <UIShell>
          <Component {...pageProps} />
        </UIShell>
      </AuthProvider>
    );
  }
}
