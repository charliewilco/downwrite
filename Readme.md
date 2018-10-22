# ![Downwrite](.github/header.png)

[![Build Status](https://travis-ci.org/charliewilco/downwrite.svg?branch=master)](https://travis-ci.org/charliewilco/downwrite)

## About

> _A place to write._ ✍️

So the idea here was simple build a simple markdown writing application. Markdown is a huge deal and all the cool tools kept getting shut down and naively,I thought, _how hard can this really be_? 🤔

So I've had poorly designed iterations of this thing for every year, on the year as one of these services got shut down. When [Canvas](https://blog.usecanvas.com/) shut down this last year, I started to get a little more serious about this idea. 💡 ⚡

During planning out some of my quarterly goals at my last job I decided to go a little more full-stack with Node and start to really work through the process of building a microservice. Since I'm never really one to learning languages and frameworks in the abstract, I decided to take up Downwrite as an excuse to build those microservices.

### Why Markdown

Markdown is probably the most efficient and universal tool for conveying syntax, semantics and structure across platforms.

Originally coined by [John Gruber (Daring Fireball)](https://daringfireball.net/projects/markdown/) it was originally conceived as a text to HTML and is the staple of static site generators, OSS as well as a fair amount of comment sections, notetaking applications
or any documentation tool.

These shortcuts are almost as ubiquitous as `cmd + b` for bold or `cmd + i` for italics.

> Bottomline: markdown is data. It is a method for describing semantics of data and is data itself.

## Features

This is meant to be a simple writing application with some key features:

- Write wherever you are (even offline) in markdown
- Share what you've written if you want
- Upload a markdown file from your machine
- Export to a static markdown file for your blog, etc.

## Setup

This project uses [Yarn Workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/)

```bash
brew cask install yarn
yarn
```

### Client

![Logos for Related Projects](.github/Client.png)

#### Working on this Project

Run in your terminal from the root of the project.

```bash
yarn workspace client dev
```

Open `http://localhost:3000` in your browser.

#### Info

This is the client-side of the application. It uses Next.js and Express and uses [this example](https://github.com/zeit/next.js/tree/canary/examples/custom-server-express) to handle routing to different views.

Downwrite needs to server side rendered to make sharing an entry as easy as possible. Next.js' data-fetching API makes it the perfect candidate.

The Express server also proxies the API server `localhost:4000` under the hood.

#### Related Documentation

- React
- Next.js
- Styled Components
- Draft.js
- MDX

### API

![Logos for Related Projects](.github/API.png)

#### Working on this Project

```bash
cd api
docker-compose up --build -d
```

or

```bash
yarn workspace api dev
```

This project depends on MongoDB

#### Info

You can see the documented routes at `http://localhost:3000/docs`

#### Related Docs

- Hapi.js
- MongoDB
- Docker

### Integration Testing

![Logos for Related Projects](.github/Integration.png)

### Related Docs

- Puppeteer
- Jest

### Workflow

![Logos for Related Projects](.github/Workflow.png)

Working on this project uses Travis to run the tests and deploy the successfully built workspaces to their given endpoints.
