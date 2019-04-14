import * as React from "react";
import Header from "./header";
import Footer from "./footer";
import NightMode, { NightModeTrigger } from "./night-mode";
import { ErrorContainer, UIErrorBanner } from "./ui-error";
import { LocalUISettingsProvider } from "./local-ui-settings";
import "./styles/base.css";

interface IUIShell {
  children: React.ReactNode;
}

export function UIShell(props: IUIShell) {
  return (
    <NightMode>
      <LocalUISettingsProvider>
        <div className="UIContainer">
          <ErrorContainer>
            <NightModeTrigger>
              <UIErrorBanner />
              <div className="clearfix">
                <div style={{ minHeight: "100%" }}>
                  <Header />
                  {props.children}
                  <Footer />
                </div>
              </div>
            </NightModeTrigger>
          </ErrorContainer>
        </div>
      </LocalUISettingsProvider>
    </NightMode>
  );
}
