import Header from "./header";
import Footer from "./footer";
import { MessageList } from "./ui-notification";
import { useDarkModeEffect, DarkModeVals } from "../hooks";

interface IUIShell extends React.PropsWithChildren<{}> {}

export function UIShell(props: IUIShell): JSX.Element {
  useDarkModeEffect(DarkModeVals.NIGHT_MODE);
  return (
    <div className="UIContainer">
      <div className="clearfix">
        <div style={{ minHeight: "100%" }}>
          <Header />
          <main>{props.children}</main>
          <Footer />
        </div>
      </div>
      <MessageList />
    </div>
  );
}
