import * as React from "react";
import { AppProps } from "next/app";
import isEmpty from "lodash/isEmpty";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import "../components/styles/base.css";

const App = ({ Component, pageProps }: AppProps) => {
  const authed = !isEmpty(pageProps.token);
  console.log("PAGE PROPS TOKEN", { token: pageProps.token });
  return (
    <AuthProvider token={pageProps.token} authed={authed}>
      <UIShell>
        <Component {...pageProps} />
      </UIShell>
    </AuthProvider>
  );
};

export default App;
