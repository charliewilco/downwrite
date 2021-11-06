import { AppProps } from "next/app";
import Router from "next/router";
import { useEffect } from "react";
import * as Analytics from "fathom-client";
import { UIShell } from "@components/ui-shell";
import { AppProvider } from "@reducers/app";
import "@reach/tabs/styles.css";
import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/checkbox/styles.css";

Router.events.on("routeChangeComplete", () => {
  Analytics.trackPageview();
});

export default function CustomAppWrapper({ Component, pageProps }: AppProps) {
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
    <AppProvider initial={pageProps.initialAppState}>
      <UIShell>
        <Component {...pageProps} />
      </UIShell>
    </AppProvider>
  );
}
