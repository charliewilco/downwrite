import dynamic from "next/dynamic";
import { FiAlertTriangle } from "react-icons/fi";
import { UIHeader } from "./header";
import { UIFooter } from "./footer";
import { Banner } from "./banner";

interface IUIShell extends React.PropsWithChildren<{}> {}

const MessageList = dynamic(() => import("@components/notification-list"));

export function UIShell(props: IUIShell): JSX.Element {
  return (
    <div className="flex flex-col">
      <div className="clearfix min-h-full">
        <UIHeader />
        <Banner>
          <div className="flex items-center">
            <FiAlertTriangle className="mr-4 " />
            <span className="text-sm font-bold">
              This app is currently in a major major alpha. Swim at your own risk.
            </span>
          </div>
        </Banner>
        <main>{props.children}</main>
        <UIFooter />
      </div>
      <MessageList />
    </div>
  );
}
