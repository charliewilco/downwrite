import * as React from "react";
import styled from "styled-components";
import Nav from "./nav";
import Toggle from "./toggle";
import Header from "./header";
import Footer from "./footer";
import NightMode, { NightModeTrigger } from "./night-mode";
import UIContainer from "./ui-container";
import { ErrorContainer, UIErrorBanner } from "./ui-error";
import { LevelStyles } from "./level-styles";
import { LocalUISettingsProvider } from "./local-ui-settings";

import "../utils/global.css";

const ClearFixed = styled.div`
  &::after {
    content: "";
    display: table;
    clear: both;
  }
`;

const Container = styled.div`
  min-height: 100%;
`;

interface IUIShell {
  authed?: boolean;
  children: React.ReactNode;
  token: string;
}

export const UIShell: React.SFC<IUIShell> = ({ children, token }) => (
  <NightMode>
    <LocalUISettingsProvider>
      <UIContainer>
        <LevelStyles />
        <ErrorContainer>
          <Toggle>
            {({ isOpen, onToggle, onClose }) => (
              <NightModeTrigger>
                <UIErrorBanner />
                <ClearFixed>
                  <Container>
                    <Header onClick={onToggle} />
                    {children}
                    <Footer />
                  </Container>
                  {isOpen && <Nav closeNav={onClose} token={token} />}
                </ClearFixed>
              </NightModeTrigger>
            )}
          </Toggle>
        </ErrorContainer>
      </UIContainer>
    </LocalUISettingsProvider>
  </NightMode>
);
