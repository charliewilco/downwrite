import React, { Component } from 'react'

export const AfterRoot = () => <div id="root">DO_NOT_DELETE_THIS_YOU_WILL_BREAK_YOUR_APP</div>

export const AfterData = ({ data }) => (
  <script
    id="server-app-state"
    type="application/json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({ ...data }).replace(/<\/script>/g, '%3C/script%3E')
    }}
  />
)

export default class Document extends Component {
  static async getInitialProps({ assets, data, renderPage }) {
    const page = await renderPage()
    return { assets, data, ...page }
  }

  render() {
    const { helmet, assets, data } = this.props
    // get attributes from React Helmet
    const htmlAttrs = helmet.htmlAttributes.toComponent()
    const bodyAttrs = helmet.bodyAttributes.toComponent()

    return (
      <html {...htmlAttrs}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {assets.client.css && <link rel="stylesheet" href={assets.client.css} />}
        </head>
        <body {...bodyAttrs}>
          <div className="hi">
            <AfterRoot />
            <AfterData data={data} />
          </div>
          <script
            type="text/javascript"
            src={assets.client.js}
            defer
            crossOrigin="anonymous"
          />
        </body>
      </html>
    )
  }
}
