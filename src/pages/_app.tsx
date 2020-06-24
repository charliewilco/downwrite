import { memo } from "react";
import { AppProps } from "next/app";
import is from "@sindresorhus/is";
import { ApolloProvider } from "@apollo/react-hooks";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import { CookiesProvider, useCookies } from "react-cookie";
import "../components/styles/base.css";
import { useApollo } from "../lib/apollo";

interface IAppProps {
  token?: string;
}

const MemoUIShell = memo(UIShell);

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
  const [{ DW_TOKEN }] = useCookies();
  const authed = !is.emptyString(DW_TOKEN);

  console.log(DW_TOKEN);

  const client = useApollo(pageProps.initialApolloState);

  return (
    <CookiesProvider>
      <ApolloProvider client={client}>
        <AuthProvider token={DW_TOKEN} authed={authed}>
          <MemoUIShell>
            <Component {...pageProps} />
          </MemoUIShell>
        </AuthProvider>
      </ApolloProvider>
    </CookiesProvider>
  );
}
