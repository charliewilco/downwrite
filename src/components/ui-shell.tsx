import Header from "./header";
import Footer from "./footer";
import { MessageList } from "./ui-notification";

interface IUIShell extends React.PropsWithChildren<{}> {}

export function UIShell(props: IUIShell): JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="clearfix min-h-full">
        <Header />
        <main>{props.children}</main>
        <Footer />
      </div>
      <MessageList />
    </div>
  );
}
