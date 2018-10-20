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

## Setup

This project uses [Yarn Workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) and [Bolt](https://github.com/boltpkg/bolt)

```bash
brew cask install yarn
yarn
```

## Services

### Stack

- React
- Draft.js
- Next.js
- styled-components
- TypeScript
- Hapi
- MongoDB
- JWT

### Contents

- `client` Client - React + Next.js + Express + Draft.js
- `api` REST API - Hapi.js
- `e2e` End to End Tests - Jest + Puppeteer

### Upcoming

- `graph` - GraphQL API - Express + Mongo
- `@downwrite/markings` Helpers for Markdown - Draft.js + Markdown

### Commands

```bash
yarn dev
yarn build
yarn deploy
```

### Adding New Project

Each new service needs the following in their `package.json`:

```json
{
  "private": true,
  "scripts": {
    "build": "",
    "deploy": "now && now alias",
    "start": "",
    "dev": "",
    "test": "jest"
  },
  "now": {
    "alias": "dwn-endpointname"
  }
}
```
