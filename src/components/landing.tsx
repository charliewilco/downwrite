import * as React from "react";
import { LocalUISettings } from "./local-ui-settings";
import * as DefaultStyles from "../utils/default-styles";

interface ILandingPageProps {
  children: React.ReactNode;
}

export default function LandingPage(props: ILandingPageProps): JSX.Element {
  const { monospace } = React.useContext(LocalUISettings);
  return (
    <article
      className="LandingContainer Wrapper Wrapper--sm u-center"
      style={{ fontFamily: monospace || DefaultStyles.Fonts.monospace }}>
      <img className="BannerImage" src="/static/landing.png" />
      <header className="IntroContents">
        <h1 className="IntroTitle" data-testid="Login Page Container">
          Downwrite
        </h1>
        <span className="Tagline">A place to write</span>
      </header>
      {props.children}
    </article>
  );
}
