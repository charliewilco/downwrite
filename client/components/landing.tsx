import * as React from "react";
import { LocalUISettings } from "./local-ui-settings";
import * as DefaultStyles from "../utils/defaultStyles";
import { NightModeContext } from "./night-mode";

const LandingPage: React.FC<{ children: React.ReactNode }> = props => {
  const theme = React.useContext(NightModeContext);
  const { monospace } = React.useContext(LocalUISettings);
  return (
    <article>
      <img className="BannerImage" src="/static/landing.png" />
      <header className="IntroContents">
        <h1 className="IntroTitle" data-testid="Login Page Container">
          Downwrite
        </h1>
        <span className="Tagline">A place to write</span>
      </header>
      {props.children}
      <style jsx>{`
        article {
          font-family: ${monospace || DefaultStyles.Fonts.monospace};
          text-align: center;
          margin-bottom: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 33rem;
          width: 100%;
        }

        .IntroTitle {
          color: ${theme.night ? "white" : "#185A70"};
          font-size: 24px;
          font-family: ${DefaultStyles.Fonts.sans};
          font-weight: 900;
        }

        .IntroContents {
          padding: 32px 0 0;
          margin-bottom: 64px;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .Tagline {
          font-weight: 700;
          font-style: italic;
          color: var(--landingPageTitle);
        }

        .BannerImage {
          max-width: 200px;
          z-index: 0;
        }

        @media (min-width: 57.75rem) {
          article {
            padding-top: 65px;
          }
        }
      `}</style>
    </article>
  );
};

export default LandingPage;
