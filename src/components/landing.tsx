import * as DefaultStyles from "../utils/default-styles";
import { useSettings } from "../reducers/app-state";

interface ILandingPageProps extends React.PropsWithChildren<{}> {}

export default function LandingPage(props: ILandingPageProps): JSX.Element {
  const [{ editorFont }] = useSettings();
  return (
    <article
      className="LandingContainer Wrapper Wrapper--sm u-center"
      style={{ fontFamily: editorFont || DefaultStyles.Fonts.monospace }}>
      <img alt="Downwrite Logo" className="BannerImage" src="/static/landing.png" />
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
