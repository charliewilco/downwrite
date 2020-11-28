import Head from "next/head";
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
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
      </Head>
      <div className="clearfix min-h-full">
        <UIHeader />
        <Banner>
          <div className="flex items-center">
            <FiAlertTriangle className="mr-4 lg:h-5 lg:w-5" />
            <span className="text-xs lg:text-sm">
              This app is currently in a major major alpha.
              <br />
              Swim at your own risk.
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
