import serialize from 'serialize-javascript'
import { __IS_PROD__ } from './dev'

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const createScriptTag = (src, options) =>
  `<script src="${src}" ${options.crossorigin && 'crossorigin'}></script>`
const createLinkTag = href => `<link rel="stylesheet" type="text/css" href="${href}" />`
const defaultTitleTag = '<title>Downwrite</title>'

export default (tags, markup, chunks, globals, helmet) => `
<!doctype html>
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    ${helmet.title ? helmet.title.toString() : defaultTitleTag}
    <meta name='theme-color' content='#4FA5C2' />
    <meta name='description' content='Downwrite is a place to write' />
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <link rel='shortcut icon' href='/favicon.ico' />

    ${tags}
    ${assets.client.css ? createLinkTag(assets.client.css) : ''}
    <style>
      .__noScroll {
        overflow: hidden !important;
        position: fixed !important;
      }
    </style>
    <link rel='manifest' href='/manifest.json' />
    <link rel="preload" as="style" type="text/css" href="https://cloud.typography.com/7107912/7996792/css/fonts.css" />
    ${createLinkTag('https://cloud.typography.com/7107912/7996792/css/fonts.css')}
  </head>
  <body>
    <div class='Root' id="root">${markup}</div>
    ${
      __IS_PROD__
        ? createScriptTag(assets.client.js, { crossorigin: false })
        : createScriptTag(assets.client.js, { crossorigin: true })
    }
    <script id='loadcss'></script>
    <script>window.__initialData__ = ${serialize(globals.initialData)}</script>
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
    <script>window.main();</script>
  </body>
</html>
`
