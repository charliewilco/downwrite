import * as React from "react";
import Header from "./header";
import Footer from "./footer";
import NightMode from "./night-mode";
import { ErrorContainer, UIErrorBanner } from "./ui-error";
import { LocalUISettingsProvider } from "./local-ui-settings";
import "./styles/base.css";
import { NotificationProvider } from "../reducers/notifications";

interface IUIShell {
  children: React.ReactNode;
}

export function UIShell(props: IUIShell) {
  return (
    <NightMode>
      <LocalUISettingsProvider>
        <div className="UIContainer">
          <NotificationProvider>
            <ErrorContainer>
              <UIErrorBanner />
              <div className="clearfix">
                <div style={{ minHeight: "100%" }}>
                  <Header />
                  {props.children}
                  <Footer />
                </div>
              </div>
            </ErrorContainer>
          </NotificationProvider>
        </div>
      </LocalUISettingsProvider>
    </NightMode>
  );
}
