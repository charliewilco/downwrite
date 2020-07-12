import { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { RecoilRoot } from "recoil";
import { UIShell } from "@components/ui-shell";
import { useApollo } from "@lib/apollo";
import { useInitialRecoilSnapshot } from "@atoms/initial";
import "../styles.css";

export default function CustomAppWrapper({ Component, pageProps }: AppProps) {
  const client = useApollo(pageProps.initialApolloState);
  const initializeState = useInitialRecoilSnapshot(pageProps.initialState);

  return (
    <ApolloProvider client={client}>
      <RecoilRoot initializeState={initializeState}>
        <UIShell>
          <Component {...pageProps} />
        </UIShell>
      </RecoilRoot>
    </ApolloProvider>
  );
}
