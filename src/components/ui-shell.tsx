import Head from "next/head";
import { FiAlertTriangle } from "react-icons/fi";
import { UIHeader } from "./header";
import { UIFooter } from "./footer";
import { Banner } from "./banner";
import { MessageList } from "./notification-list";

interface IShellProps {}

const icon = <FiAlertTriangle className="text-white w-4 h-4" />;

export const UIShell: React.FC<IShellProps> = (props) => {
  return (
    <div>
      <div className="clearfix min-h-full">
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
            key="viewport"
          />
        </Head>
        <UIHeader />
        <Banner icon={icon}>
          This app is currently in a major major alpha. Swim at your own risk.
        </Banner>
        <main className="min-h-full">{props.children}</main>
        <UIFooter />
      </div>
      <MessageList />
    </div>
  );
};
