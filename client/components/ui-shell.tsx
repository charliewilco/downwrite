import * as React from "react";
import Header from "./header";
import Footer from "./footer";
import NightModeProvider from "./night-mode";
import { LocalUISettingsProvider } from "./local-ui-settings";
import "./styles/base.css";
import { NotificationProvider } from "../reducers/notifications";
import { MessageList } from "./ui-notification";

interface IUIShell {
  children: React.ReactNode;
}

export function UIShell(props: IUIShell) {
  return (
    <LocalUISettingsProvider>
      <div className="UIContainer">
        <NotificationProvider>
          <div className="clearfix">
            <div style={{ minHeight: "100%" }}>
              <NightModeProvider>
                <Header />
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
