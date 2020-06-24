import { memo } from "react";
import { AppProps } from "next/app";
import is from "@sindresorhus/is";
import { ApolloProvider } from "@apollo/client";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import "../components/styles/base.css";
import { useApollo } from "../lib/apollo";

interface IAppProps {
  token?: string;
}

const MemoUIShell = memo(UIShell);

const DW_TOKEN = "";

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
  const authed = !is.emptyString(DW_TOKEN);

  const client = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={client}>
      <AuthProvider token={DW_TOKEN} authed={authed}>
        <MemoUIShell>
          <Component {...pageProps} />
        </MemoUIShell>
      </AuthProvider>
    </ApolloProvider>
  );
}
