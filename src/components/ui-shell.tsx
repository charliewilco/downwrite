import dynamic from "next/dynamic";
import { UIHeader } from "./header";
import { UIFooter } from "./footer";

interface IUIShell extends React.PropsWithChildren<{}> {}

const MessageList = dynamic(() => import("@components/notification-list"));

export function UIShell(props: IUIShell): JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="clearfix min-h-full">
        <UIHeader />
        <main>{props.children}</main>
        <UIFooter />
      </div>
      <MessageList />
    </div>
  );
}
