import { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { RecoilRoot } from "recoil";
import is from "@sindresorhus/is";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import "../components/styles/base.css";
import { useApollo } from "../lib/apollo";
import { useInitialRecoilSnapshot } from "../atoms";

interface IAppProps {
  token?: string;
}

const DW_TOKEN = "";

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
  const authed = !is.emptyString(DW_TOKEN);

  const client = useApollo(pageProps.initialApolloState);
  const initializeState = useInitialRecoilSnapshot({});

  return (
    <ApolloProvider client={client}>
      <RecoilRoot initializeState={initializeState}>
        <AuthProvider token={DW_TOKEN} authed={authed}>
          <UIShell>
            <Component {...pageProps} />
          </UIShell>
        </AuthProvider>
      </RecoilRoot>
    </ApolloProvider>
  );
}
