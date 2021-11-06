import Document, { Html, Head, Main, NextScript } from "next/document";

export default class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link
            type="text/css"
            rel="stylesheet"
            href="https://unpkg.com/ganymede-light-duotone-prism"
          />
          <meta name="theme-color" content="#4FA5C2" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
