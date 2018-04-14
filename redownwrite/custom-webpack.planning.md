# Custom Webpack

So we're going to need somethings

- We're going to need custom babel
- We're going to need custom eslint reporting
- We're going to need custom postcss (which we can add more to)
- We're going to need custom jest setup
- We're going to need an HMR express with dev server
- We're going to need to update the service worker precache plugins
- We're going to need to use the Offline Plugin
- We're going to need to use React Loadable
- We're going to need multiple entry points for `server.js` and one for `client.js`
- We're going to need to proxy the end points
- We're going to need integration testing (maybe this should be it's own workspace)

Should

- keep all configs in package.json
- try and scaffold out the components in redownwrite into UI package

Eventually:

- We're going to need to handle GraphQL tags in the ES6

But if we go toward the GraphQL end of things we can experiment with another workspace and react scripts

Using an SSR approach would remove the need for working with HTML Plugins for webpack. The renderer template literal will need to account for the `#root`, the favicon, the manifest file.

```js
`
<!DOCTYPE html>
  <head>
    <meta name='theme-color' content='#4FA5C2' />
    <title>Downwrite</title>
    ${tags}
    ${createLinkTag({ href: `/static/css/${link}` })}
  </head>
  <body>
    <div id="root">
      ${body}
    </div>
    ${bundles.map(src => createScriptTag({ src }))}
    ${createScriptTag({ src: `/static/js/${scripts}` })}
  </body>
</html>
`
```
