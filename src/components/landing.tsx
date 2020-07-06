interface ILandingPageProps extends React.PropsWithChildren<{}> {}

export default function LandingPage(props: ILandingPageProps): JSX.Element {
  return (
    <article className="font-mono text-center max-w-lg mx-auto mb-24">
      <img
        alt="Downwrite Logo"
        className="mx-auto max-w-xxs w-full h-auto block mb-12"
        style={{
          filter: "grayscale(50%)"
        }}
        src="/static/landing.png"
      />
      <header className="mb-12">
        <h1
          className="text-3xl font-sans font-black"
          data-testid="Login Page Container">
          Downwrite
        </h1>
        <span className="text-sm uppercase tracking-widest opacity-50">
          A place to write
        </span>
      </header>
      <section className="text-left">{props.children}</section>
    </article>
  );
}
