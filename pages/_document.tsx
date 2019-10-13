import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext
} from "next/document";

export default class MyDocument extends Document {
  public static async getInitialProps(context: DocumentContext) {
    const initialProps = await Document.getInitialProps(context);

    return { ...initialProps };
  }

  public render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="stylesheet"
            href="https://unpkg.com/ganymede-light-duotone-prism"
          />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
            key="viewport"
          />
          <meta name="theme-color" content="#4FA5C2" />
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
