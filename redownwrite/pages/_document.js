import Document, { Head, Main, NextScript } from 'next/document'
import Manifest from 'next-manifest/manifest'
import SW from '../components/service-worker'
import { ServerStyleSheet } from 'styled-components'

import '../utils/global.css'

export default class MyDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context)
    const sheet = new ServerStyleSheet()

    const page = context.renderPage(App => props =>
      sheet.collectStyles(<App {...props} />)
    )

    const styleTags = sheet.getStyleElement()
    return { ...page, ...initialProps, styleTags }
  }

  render() {
    return (
      <html>
        <Head>
          <title>Downwrite</title>
          {this.props.styleTags}
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
            key="viewport"
          />
          <Manifest href="/static/manifest/manifest.json" themeColor="#4FA5C2" />
          <link rel="stylesheet" href="/_next/static/style.css" />
          <link
            rel="preload"
            as="style"
            type="text/css"
            href="https://cloud.typography.com/7107912/7996792/css/fonts.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://cloud.typography.com/7107912/7996792/css/fonts.css"
          />
          <link rel="icon" href="/static/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <SW />
        </body>
      </html>
    )
  }
}
