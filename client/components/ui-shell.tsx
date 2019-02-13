import * as React from "react";
import styled from "styled-components";
import Header from "./header";
import Footer from "./footer";
import NightMode, { NightModeTrigger } from "./night-mode";
import UIContainer from "./ui-container";
import { ErrorContainer, UIErrorBanner } from "./ui-error";
import { LevelStyles } from "./level-styles";
import { LocalUISettingsProvider } from "./local-ui-settings";

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

export const UIShell: React.FC<IUIShell> = props => (
  <NightMode>
    <LocalUISettingsProvider>
      <UIContainer>
        <LevelStyles />
        <ErrorContainer>
          <NightModeTrigger>
            <UIErrorBanner />
            <ClearFixed>
              <Container>
                <Header />
                {props.children}
                <Footer />
              </Container>
            </ClearFixed>
          </NightModeTrigger>
        </ErrorContainer>
      </UIContainer>
    </LocalUISettingsProvider>
  </NightMode>
);
