# ![Downwrite](.github/header.png)

[![Build Status](https://travis-ci.org/charliewilco/downwrite.svg?branch=master)](https://travis-ci.org/charliewilco/downwrite)

## About 🤔🦄🎉

> _A place to write._ ✍️

So the idea here was simple build a simple markdown writing application. Markdown is a huge deal and all the cool tools kept getting shut down and naively,I thought, _how hard can this really be_? 🤔📝📦

So I've had poorly designed iterations of this thing for every year, on the year as one of these services got shut down. When [Canvas](https://blog.usecanvas.com/) shut down this last year, I started to get a little more serious about this idea. 💡 ⚡🔭

During planning out some of my quarterly goals at my last job I decided to go a little more full-stack with Node and start to really work through the process of building a microservice. Since I'm never really one to learning languages and frameworks in the abstract, I decided to take up Downwrite as an excuse to build those microservices. 📡💸🌎

### Why Markdown 🧐🤨📋

Markdown is probably the most efficient and universal tool for conveying syntax, semantics and structure across platforms. ⬇️

Originally coined by [John Gruber (Daring Fireball)](https://daringfireball.net/projects/markdown/) it was originally conceived as a text to HTML and is the staple of static site generators, OSS as well as a fair amount of comment sections, notetaking applications or any documentation tool. 🛠

These shortcuts are almost as ubiquitous as `cmd + b` for bold or `cmd + i` for italics. ⌨️

> Bottomline: markdown is data. It is a method for describing semantics of data and is data itself.

## Features ✨🔥🚀

This is meant to be a simple writing application with some key features:

- Write wherever you are (even offline) in markdown
- Share what you've written if you want
- Upload a markdown file from your machine
- Export to a static markdown file for your blog, etc.

## Setup 📲⏳⚙️

This project uses [Yarn Workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) and is written mostly with [TypeScript](https://www.typescriptlang.org/).

```bash
brew cask install yarn
yarn
```

### Client ⚡️🦊

![Logos for Related Projects](.github/Client.png)

#### Working on this Project

Run in your terminal from the root of the project.

```bash
yarn workspace client dev
```

Open [`http://localhost:3000`](http://localhost:3000) in your browser.

#### Info 📝

This is the client-side of the application. It uses Next.js and Express and uses [this example](https://github.com/zeit/next.js/tree/canary/examples/custom-server-express) to handle routing to different views. 👨‍💻🤜🦑🤯

Downwrite needs to server side rendered to make sharing an entry as easy as possible. Next.js' data-fetching API makes it the perfect candidate. The Express server also proxies the API server `localhost:4000` under the hood. So when the page calls `Component.getInitialProps()` it fetches the data from the API server and for the initial render it has data available instead of a skeleton screen. 🤖☠️💀

For the Editor this project uses Draft.js and Draft.js Plugins. Markdown syntax is used inline and autogenerates the related rich text `_hello_` becomes "_hello_" as you type.💻⌨️🔏

For styles I've used ~~Aphrodite~~, ~~JSXStyle~~, ~~glamor~~, and styled-components 💅. Most components are just `styled.div`\`\`; [managing class names hasn't really ever been my thing](https://charlespeters.net/writing/i-just-cant-with-css/). The styling also includes a Night theme that's managed through styled component's `<ThemeProvider>` and `localStorage`. 🌘🌛🌌 So it only ever renders on the client.

This project is a PWA, it uses some basic service worker implementation and `manifest.json` managed by `next.config.js`. 

#### Related Documentation 📚

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Styled Components](https://www.styled-components.com/)
- [Draft.js](https://draftjs.org/)
- [Draft.js Plugins](https://www.draft-js-plugins.com/)
- [MDX](https://mdxjs.com/)

### API 🌎✨

![Logos for Related Projects](.github/API.png)

#### Working on this Project

Docker 🐳🐋

```bash
cd api
docker-compose up --build -d
```

or run the server locally 👨‍💻

```bash
yarn workspace api dev
```

This project depends on MongoDB 🍍 so if you're not using Docker 🐳🐋 locally, you should see this [gist](https://gist.github.com/nrollr/9f523ae17ecdbb50311980503409aeb3) on how to setup MongoDB on your machine.

#### Info 📝

Using hapi allows you to organize your endpoints very easiy and all the controllers are async so making database queries are fast and clean. All the routes are kept in `./api/src/routes.ts`. 🛣

This service handles authentication with JWT and basic CRUD functions. 🔐

You can see the documented endpoints at `http://localhost:3000/docs`

#### Related Documentation 📚

- [Hapi.js](https://hapijs.com/)
- [MongoDB](https://docs.mongodb.com/manual/support/) & [Mongoose.js](http://mongoosejs.com)
- [Docker](https://docs.docker.com/)
- [JWT](https://auth0.com/blog/hapijs-authentication-secure-your-api-with-json-web-tokens/)

### Integration Testing 🌈🦁🐛

![Logos for Related Projects](.github/Integration.png)

#### Working on the Project

```bash
yarn workspace integration test
```

#### Info 📝

Short hand: `page` is just a representation of whatever the headless browser, _Puppeteer_ has rendered at that given moment.

Using Puppeteer I write assertions like this:

```js
describe("Feature", () => {
  it("does this thing", async () => {
    await page.waitForSelector("#selector");
    await page.click("#selector");
    await page.waitForSelector("#other-selector");
  });
});
```

This approach accomplishes two things:

- Ensures if an `await` statement errors or `catch()` the block will cause a failure
- Makes the test sequential and simpler to write

#### Related Documentation 📚

- [Puppeteer](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)
- [Jest](https://jestjs.io/)
- [_End-to-end Tests that Don’t Suck with Puppeteer_ from Trevor Miller](https://ropig.com/blog/end-end-tests-dont-suck-puppeteer/)
- [_Write tests. Not too many. Mostly integration._ from Kent C. Dodds](https://blog.kentcdodds.com/write-tests-not-too-many-mostly-integration-5e8c7fff591c)

### Workflow 👷‍♀️🚧

![Logos for Related Projects](.github/Workflow.png)

Working on this project uses Travis to run the tests and deploy the successfully built workspaces to their given endpoints. It uses [`now`](https://zeit.co/now) for deployments for easy rollback and immutable deployments.

## License ⚖️💣🛡⚔️

MIT License

Copyright (c) 2018 Charles Peters

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
