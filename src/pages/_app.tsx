import { AppProps } from "next/app";
import Router from "next/router";
import { ApolloProvider } from "@apollo/client";
import * as Analytics from "fathom-client";
import { UIShell } from "@components/ui-shell";
import { useApollo } from "@lib/apollo";
import { AppProvider } from "@reducers/app";
import "../styles.css";
import { useEffect } from "react";

Router.events.on("routeChangeComplete", () => {
  Analytics.trackPageview();
});

export default function CustomAppWrapper({ Component, pageProps }: AppProps) {
  const client = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    Analytics.load("FENETBXC", {
      includedDomains: [
        "downwrite.us",
        "alpha.downwrite.us",
        "beta.downwrite.us",
        "next.downwrite.us"
      ]
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      <AppProvider initial={pageProps.initialAppState}>
        <UIShell>
          <Component {...pageProps} />
        </UIShell>
      </AppProvider>
    </ApolloProvider>
  );
}
