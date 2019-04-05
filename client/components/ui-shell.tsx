import * as React from "react";
import Header from "./header";
import Footer from "./footer";
import NightMode, { NightModeTrigger } from "./night-mode";
import { ErrorContainer, UIErrorBanner } from "./ui-error";
import { LevelStyles } from "./level-styles";
import { LocalUISettingsProvider } from "./local-ui-settings";

interface IUIShell {
  authed?: boolean;
  children: React.ReactNode;
  token: string;
}

export const UIShell: React.FC<IUIShell> = function(props) {
  return (
    <NightMode>
      <LocalUISettingsProvider>
        <div className="UIContainer">
          <LevelStyles />
          <ErrorContainer>
            <NightModeTrigger>
              <UIErrorBanner />
              <div className="clearfix">
                <div style={{ minHeight: "100%" }}>
                  <Header />
                  {props.children}
                  <Footer />
                </div>
              </div>
            </NightModeTrigger>
          </ErrorContainer>
        </div>
        <style jsx global>{`
          .UIContainer {
            color: var(--color);
            background: var(--background);
            display: flex;
            flex-direction: column;
            flex: 1;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            overflow: scroll;
          }

          .UIContainer::before {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            display: block;
            height: 4px;
            width: 100%;
            background-image: linear-gradient(to right, #2584a5, #4fa5c2);
          }

          .clearfix::after {
            content: "";
            display: table;
            clear: both;
          }

          .UIContainer a {
            background-color: transparent;
            text-decoration: none;
            color: var(--link);
          }

          .UIContainer a:active,
          .UIContainer a:hover {
            color: var(--linkHover);
            outline: 0;
          }

          .ContainerTitle {
            font-weight: 900;
            font-size: 24px;
          }

          .Wrapper {
            margin-left: auto;
            margin-right: auto;
            max-width: 1088px;
          }

          .Wrapper--xs {
            max-width: 384px;
          }

          .Wrapper--sm {
            max-width: 768px;
          }

          code,
          pre {
            font-family: "Input Mono", "SF Mono", Consolas, "Liberation Mono", Menlo,
              monospace;
            font-size: 100%;
          }

          p:not(:last-of-type) {
            margin-bottom: 1rem;
          }
        `}</style>
      </LocalUISettingsProvider>
    </NightMode>
  );
};
