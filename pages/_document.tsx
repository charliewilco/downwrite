import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  public render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="stylesheet"
            href="https://unpkg.com/ganymede-light-duotone-prism"
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
