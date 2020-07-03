interface ILandingPageProps extends React.PropsWithChildren<{}> {}

export default function LandingPage(props: ILandingPageProps): JSX.Element {
  return (
    <article className="LandingContainer font-mono text-center container container-sm mx-auto">
      <img
        alt="Downwrite Logo"
        className="BannerImage"
        style={{
          filter: "grayscale(100%)"
        }}
        src="/static/landing.png"
      />
      <header className="IntroContents">
        <h1
          className="text-3xl font-sans font-black"
          data-testid="Login Page Container">
          Downwrite
        </h1>
        <span className="text-sm uppercase tracking-widest opacity-50">
          A place to write
        </span>
      </header>
      {props.children}
    </article>
  );
}
