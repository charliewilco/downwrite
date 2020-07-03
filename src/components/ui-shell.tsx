import Header from "./header";
import Footer from "./footer";
import { MessageList } from "./ui-notification";
import { useDarkModeEffect, DarkModeVals } from "../hooks";

interface IUIShell extends React.PropsWithChildren<{}> {}

export function UIShell(props: IUIShell): JSX.Element {
  useDarkModeEffect(DarkModeVals.NIGHT_MODE);

  return (
    <div className="flex flex-col">
      <div className="clearfix">
        <div className="min-h-full">
          <Header />
          <main>{props.children}</main>
          <Footer />
        </div>
      </div>
      <MessageList />
    </div>
  );
}
