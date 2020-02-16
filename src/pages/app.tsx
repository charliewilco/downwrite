import * as React from "react";
import is from "@sindresorhus/is";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import { CookiesProvider, useCookies } from "react-cookie";
import "../components/styles/base.css";
import { HelmetProvider } from "react-helmet-async";

interface IAppProps {
  token?: string;
}

const MemoUIShell = React.memo(UIShell);

export function AppWrapper(props: React.PropsWithChildren<IAppProps>) {
  const [{ DW_TOKEN }] = useCookies();
  const authed = !is.emptyString(DW_TOKEN);

  return (
    <HelmetProvider>
      <CookiesProvider>
        <AuthProvider token={DW_TOKEN} authed={authed}>
          <MemoUIShell>{props.children}</MemoUIShell>
        </AuthProvider>
      </CookiesProvider>
    </HelmetProvider>
  );
}
