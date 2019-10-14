import * as React from "react";
import Header from "./header";
import Footer from "./footer";
import NightModeProvider from "./night-mode";
import { LocalUISettingsProvider } from "./local-ui-settings";
import "./styles/base.css";
import { NotificationProvider } from "../reducers/notifications";
import { MessageList } from "./ui-notification";

interface IUIShell extends React.PropsWithChildren<{}> {}

export function UIShell(props: IUIShell) {
  // React.useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     window.addEventListener("load", function() {
  //       navigator.serviceWorker
  //         .register("/service-worker.js", { scope: "/" })
  //         .then(function(registration) {
  //           console.log("SW registered: ", registration);
  //         })
  //         .catch(function(registrationError) {
  //           console.log("SW registration failed: ", registrationError);
  //         });
  //     });
  //   }
  // }, []);
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
