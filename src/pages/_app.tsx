import * as React from "react";
import App, { AppProps, AppContext } from "next/app";
import is from "@sindresorhus/is";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import Cookies from "universal-cookie";
import "../components/styles/base.css";

interface IAppProps extends AppProps {
  token: string;
}

export default class Downwrite extends App<IAppProps> {
  public static async getInitialProps({ Component, ctx, ...props }: AppContext) {
    let pageProps = {};
    const cookies = new Cookies(ctx.req);
    const token = cookies.get<string>("DW_TOKEN");

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps, token };
  }

  public render(): JSX.Element {
    const { Component, pageProps, token } = this.props;
    const authed = !is.emptyString(token);

    return (
      <AuthProvider token={token} authed={authed}>
        <UIShell>
          <Component {...pageProps} />
        </UIShell>
      </AuthProvider>
    );
  }
}
