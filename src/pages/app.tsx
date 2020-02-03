import * as React from "react";
import is from "@sindresorhus/is";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import { CookiesProvider, useCookies } from "react-cookie";
import "../components/styles/base.css";

interface IAppProps {
  token?: string;
}

export function AppWrapper(props: React.PropsWithChildren<IAppProps>) {
  const [{ DW_TOKEN }] = useCookies();
  const authed = !is.emptyString(DW_TOKEN);

  return (
    <CookiesProvider>
      <AuthProvider token={DW_TOKEN} authed={authed}>
        <UIShell>{props.children}</UIShell>
      </AuthProvider>
    </CookiesProvider>
  );
}
