import Head from "next/head";
import { UIHeader } from "@components/header";
import { NotificationList } from "@components/notification-list";
import { buttons } from "./button";
import { typography } from "./typography";
import { variables, reset } from "./reset";

export const UIShell: React.FC = ({ children }) => {
  return (
    <div className="outer">
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
      </Head>
      <UIHeader />
      <main>{children}</main>
      <NotificationList />
      <style jsx global>
        {variables}
      </style>
      <style jsx global>
        {reset}
      </style>
      <style jsx global>
        {buttons}
      </style>
      <style jsx global>
        {typography}
      </style>
      <style jsx global>{`
        html {
          background: var(--bg);
          color: var(--fg);
          font: 400 100% / 1.3 var(--sans-serif);
        }

        code,
        pre {
          font-size: 100%;
          font-family: var(--monospace);
        }

        a {
          color: var(--highlight);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --fg: var(--onyx-100);
            --bg: var(--onyx-1000);

            --bg-offset: #111;
            --surface: var(--onyx-900);
          }
        }
      `}</style>
      <style jsx>{`
        .outer {
          width: 100%;
          height: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        main {
          flex: 2;
          height: 100%;
        }
      `}</style>
    </div>
  );
};
