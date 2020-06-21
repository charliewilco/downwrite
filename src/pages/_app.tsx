import { memo } from "react";
import { AppProps } from "next/app";
import is from "@sindresorhus/is";
import { UIShell } from "../components/ui-shell";
import { AuthProvider } from "../components/auth";
import { CookiesProvider, useCookies } from "react-cookie";
import "../components/styles/base.css";

interface IAppProps {
  token?: string;
}

const MemoUIShell = memo(UIShell);

export default function AppWrapper({ Component, pageProps }: AppProps<IAppProps>) {
  const [{ DW_TOKEN }] = useCookies();
  const authed = !is.emptyString(DW_TOKEN);

  return (
    <CookiesProvider>
      <AuthProvider token={DW_TOKEN} authed={authed}>
        <MemoUIShell>
          <Component {...pageProps} />
        </MemoUIShell>
      </AuthProvider>
    </CookiesProvider>
  );
}
