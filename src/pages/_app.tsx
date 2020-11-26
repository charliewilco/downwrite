import { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { UIShell } from "@components/ui-shell";
import { useApollo } from "@lib/apollo";
import { AppProvider } from "@reducers/app";
import "../styles.css";

export default function CustomAppWrapper({ Component, pageProps }: AppProps) {
  const client = useApollo(pageProps.initialApolloState);

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
