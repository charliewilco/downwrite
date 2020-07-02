import { AppProps } from "next/app";
import is from "@sindresorhus/is";
import { ApolloProvider } from "@apollo/client";
import { RecoilRoot } from "recoil";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import "../components/styles/base.css";
import { useApollo } from "../lib/apollo";
import { initializeState } from "../reducers/app-state";

interface IAppProps {
  token?: string;
}

const DW_TOKEN = "";

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
  const authed = !is.emptyString(DW_TOKEN);

  const client = useApollo(pageProps.initialApolloState);

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
