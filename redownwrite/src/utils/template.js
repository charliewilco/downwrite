import serialize from 'serialize-javascript'
import { __IS_PROD__ } from './dev'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const createScriptTag = (src, options) =>
  `<script src="${src}" ${options.crossorigin && 'crossorigin'}></script>`
const createLinkTag = href => `<link rel="stylesheet" type="text/css" href="${href}" />`

export default (tags, markup, chunks, context) => `
<!doctype html>
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    <meta name='theme-color' content='#4FA5C2' />
    <title>Downwrite</title>
    ${tags}
    ${assets.client.css ? createLinkTag(assets.client.css) : ''}
    <link rel='manifest' href='/manifest.json' />
    <link rel="preload" as="style" type="text/css" href="https://cloud.typography.com/7107912/7996792/css/fonts.css" />
    ${createLinkTag('https://cloud.typography.com/7107912/7996792/css/fonts.css')}
  </head>
  <body>
    <div class='Root' id="root">${markup}</div>
    ${
      __IS_PROD__
        ? createScriptTag(assets.client.js)
        : createScriptTag(assets.client.js, { crossorigin: true })
    }
    <script>window.__initialData__ = ${serialize(context)}</script>
    ${chunks
      .map(
        chunk =>
          __IS_PROD__
            ? createScriptTag(chunk.file)
            : createScriptTag(
                `http://${process.env.HOST}:${process.env.PORT + 1}/${chunk.file}`
              )
      )
      .join('\n')}
  </body>
</html>
`
