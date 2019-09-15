import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext
} from "next/document";
// import Manifest from "next-manifest/manifest";

const STYLESHEETS: string[] = ["https://unpkg.com/ganymede-light-duotone-prism"];

export default class MyDocument extends Document {
  public static async getInitialProps(context: DocumentContext) {
    const initialProps = await Document.getInitialProps(context);

    return { ...initialProps };
  }

  public render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          {STYLESHEETS.map((sss, i) => (
            <link rel="stylesheet" href={sss} key={i} />
          ))}
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
            key="viewport"
          />
          <meta name="theme-color" content="#4FA5C2" />
          {/* <Manifest href="/static/manifest/manifest.json" themeColor="#4FA5C2" /> */}
          <link rel="icon" href="/static/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
