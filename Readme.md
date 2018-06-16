# ![Downwrite](.idea/header.png)

**_Collection of Microservices and Client Side Application for Downwrite._**

## Setup

This project uses [Yarn Workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/) and [Bolt](https://github.com/boltpkg/bolt)

```bash
brew cask install yarn
yarn
```

## Services

### Contents

- `services/export-md` Export Markdown - Micro (removed)
- `redownwrite` Client - React + Next.js + Express + Draft.js
- `api-downwrite` REST API - Hapi.js

#### Upcoming

- `jwt` Auth JWT - Micro (TODO) Bearer
- `graph-downwrite` - GraphQL API - Express + Mongo
- `changelog` Engineering Notes - Gatsby
- `help` FAQ / Help Notes - Gatsby
- `@downwrite/ui` UI Library - React + Glamor
- `@downwrite/css` Shared Common Base Styles - PostCSS
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
    "build": "", // Build project, optional but should echo out it doesn't exist
    "deploy": "now && now alias", // Deploy to Now
    "start": "", // To start service post deployment
    "dev": "", // Should run a watch for build and a dev server
    "test": "jest" // Tests -- Duh!
  },
  "now": {
    "alias": "dwn-endpointname"
  }
}
```
