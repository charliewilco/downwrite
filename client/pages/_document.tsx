import Document, {
  Head,
  Main,
  NextScript,
  NextDocumentContext
} from "next/document";
// import Manifest from "next-manifest/manifest";
import { ServerStyleSheet } from "styled-components";

interface WithStyleTags {
  styleTags: any;
}

const STYLESHEETS = [
  "https://unpkg.com/base-dw",
  "https://unpkg.com/typescale-dw",
  "https://unpkg.com/ganymede-light-duotone-prism"
];

export default class MyDocument extends Document<WithStyleTags> {
  public static async getInitialProps(context: NextDocumentContext) {
    const initialProps = await Document.getInitialProps(context);
    const sheet = new ServerStyleSheet();

    const page = context.renderPage(App => props =>
      sheet.collectStyles(<App {...props} />)
    );

    const styleTags = sheet.getStyleElement();
    return { ...page, ...initialProps, styleTags };
  }

  public render(): JSX.Element {
    const { styleTags } = this.props;
    return (
      <html lang="en">
        <Head>
          {STYLESHEETS.map((sss, i) => (
            <link rel="stylesheet" href={sss} key={i} />
          ))}
          {styleTags}
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
      </html>
    );
  }
}
