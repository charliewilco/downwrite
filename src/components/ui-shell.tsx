import Head from "next/head";
import { UIHeader } from "./header";
import { UIFooter } from "./footer";
import { Banner } from "./banner";
import { MessageList } from "./notification-list";

interface IShellProps {}

export const UIShell: React.FC<IShellProps> = (props) => {
  return (
    <div>
      <div>
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
            key="viewport"
          />
        </Head>
        <UIHeader />
        <Banner>
          This app is currently in a major major alpha. Swim at your own risk.
        </Banner>
        <main>{props.children}</main>
        <UIFooter />
      </div>
      <MessageList />
    </div>
  );
};
