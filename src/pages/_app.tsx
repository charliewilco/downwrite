import { memo } from "react";
import { AppProps } from "next/app";
import is from "@sindresorhus/is";
import { ApolloProvider } from "@apollo/client";
import { RecoilRoot, MutableSnapshot } from "recoil";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import "../components/styles/base.css";
import { useApollo } from "../lib/apollo";
import { UINotificationMessage } from "../reducers/notifications";
import { notificationState } from "../reducers/app-state";

interface IAppProps {
  token?: string;
}

const MemoUIShell = memo(UIShell);

const DW_TOKEN = "";

function initializeState(m: MutableSnapshot) {
  m.set(notificationState, [new UINotificationMessage("Something")]);
}

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
  const authed = !is.emptyString(DW_TOKEN);

  const client = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={client}>
      <RecoilRoot initializeState={initializeState}>
        <AuthProvider token={DW_TOKEN} authed={authed}>
          <MemoUIShell>
            <Component {...pageProps} />
          </MemoUIShell>
        </AuthProvider>
      </RecoilRoot>
    </ApolloProvider>
  );
}
