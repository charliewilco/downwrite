import { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { RecoilRoot } from "recoil";
import { UIShell } from "../components/ui-shell";
import { useApollo } from "../lib/apollo";
import { useInitialRecoilSnapshot } from "../atoms";
import "../styles.css";

interface IAppProps {
  token?: string;
}

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
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
