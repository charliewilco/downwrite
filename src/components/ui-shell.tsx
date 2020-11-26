import * as React from "react";
import Head from "next/head";
import { UIHeader } from "./header";
import Footer from "./footer";
import NightModeProvider from "./night-mode";
import { LocalUISettingsProvider } from "./local-ui-settings";
import { NotificationProvider } from "../reducers/notifications";
import { MessageList } from "./ui-notification";

interface IUIShell {
  children: React.ReactNode;
}

export function UIShell(props: IUIShell) {
  return (
    <LocalUISettingsProvider>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
      </Head>
      <div className="UIContainer">
        <NotificationProvider>
          <div className="clearfix">
            <div style={{ minHeight: "100%" }}>
              <NightModeProvider>
                <UIHeader />
              </NightModeProvider>
              {props.children}
              <Footer />
            </div>
          </div>
          <MessageList />
        </NotificationProvider>
      </div>
    </LocalUISettingsProvider>
  );
}
