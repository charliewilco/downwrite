import Header from "./header";
import Footer from "./footer";
import NightModeProvider from "./night-mode";
import { NotificationProvider } from "../reducers/notifications";
import { MessageList } from "./ui-notification";

interface IUIShell extends React.PropsWithChildren<{}> {}

export function UIShell(props: IUIShell): JSX.Element {
  return (
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
  );
}
