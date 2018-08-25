# Downwrite

A place to write. ✍️

![](public/icon192.png)

---

So the idea here was simple build a simple markdown writing application. Markdown is a huge deal and all the cool tools kept getting shut down and naively, I thought, _how hard can this really be_? 🤔

So I've had poorly designed iterations of this thing for every year, on the year as one of these services got shut down. When [Canvas](https://blog.usecanvas.com/) shut down this last year, I started to get a little more serious about this idea. 💡 ⚡

---

During planning out some of my quarterly goals at my last job I decided to go a little more full-stack with Node and start to really work through the process of building a microservice.

Since I'm never really one to learning languages and frameworks in the abstract, I decided to take up Downwrite as an excuse to build those microservices.

---

## Why Markdown

Markdown is probably the most efficient and universal tool for conveying syntax, semantics and structure across platforms.

Originally coined by [John Gruber (Daring Fireball)](https://daringfireball.net/projects/markdown/) it was originally conceived as a text to HTML and is the staple of static site generators, OSS as well as a fair amount of comment sections, notetaking applications
or any documentation tool. 

These shortcuts are almost as ubiquitous as `cmd + b` for bold or `cmd + i` for italics.

Even this presentation was written in markdown.

---

> Bottomline: markdown is data. It is a method for describing semantics of data and is data itself.

---

## Tech Overview


![Computer problems](patton.gif)

---

### Micro Services

- Auth - using JWT and stateless authentication pattern 🔏
- Post Endpoints (Entries) - GET PUT POST DELETE for entries 🌐
- Export Service - markdown or json 📩

---

### CRA

Client-side application was built with yarn and `create-react-app` ⚛️  and never ejected. ✨

---

### Routing

The URL is the state. 🗺️
This idea from Ember.js 🐹  being a URL driven being what drives application state.

- `/` dashboard view or login
- `/new` a create a new post route
- `/:id/edit` defines a place to edit a given entry
- `/:id/preview` public preview for a given entry
- `/signout` uses react lifecycle to trash the token and redirect to the `/` route without the state of auth

---

```jsx
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

export default class extends Component {
	componentWillMount() {
		this.props.signOut()
		this.props.toggleNav()
	}

	render() {
		return (
			<Redirect 
				to={{
					pathname: '/',
					state: { from: this.props.location, authed: false }
				}}
			/>
		)
	}
}
```

---

### Draft

Using Draft.js was really a no-brainer, there's a rich set of plugins
and uses cases are extendable the API is really approachable.

- Draft.js Plugins
- Really f**ked up on mobile 🖕 😠 🤬 🐛

---

### CSS-in-JS

- CSS custom properties
- Aphrodite -> JSXStyle -> Glamor
- UI state is malleable, diffing strings is stupid.
- Font loading is hard. Maybe Google developers should solve that problem
instead of harassing and baiting the React community on Twitter. 
You know, fix the fucking platform.
- A palette utility is a good idea
- Resets are a good idea. [Level.css](https://github.com/charlespeters/level.css/) 

---

### Deployments

Now. It's a simple binary and worth every penny. 🔺
I have never found a deployment tool to be this simple and configurable and painless.

---

## Application Demo

---

### Features

- Autosaving 💾
- Night Mode 🌖
- Public entries 📝 
- Export and import markdown files ⬆️ ⬇️
- Installable on Home Screen and caches the assets 📲

---

### In Progress Features 

🔜

- Offline Mode
- Add Keywords to posts
- Search through posts
- SSR with Next.js and Express

---

## Takeaways

![done](done.gif)

---

### Global State

Very little state here is global

- Authorization: Cookie
- Night Theme: localstorage
- Entries: Server
- Views: `window.location`

---

### a11y

- Focus states are thing that are hard to replicate outside of HTML defaults
- Tab indexes are tricky alchemy
- React needs to make up their mind on HTML attrs dashes or camelCase, just pick

---

### Testing

I need to stop f**king around on this one and pick a direction.

---

> Write tests. Not too many. Mostly integration. -- Guillermo Rauch

_founder of Zeit and CloudUp, creator of Socket.io, mongoose.js, Slackin, Now, MooTools and whole pile of other shit_

---

- Puppeteer and Jest are a match made in heaven. 
- Writing asserts in the same way you would test a component is invaluable to your productivity.
- For writing unit tests with React, Components should be easy to test.
-- Components should do one thing
-- Components have methods that are easy to spy on
-- Mocking out dependencies shouldn't be difficult.
- Writing snapshots should be the easiest test you write. 
- React Router components will kill your snapshots.
- Asking what this component or piece of UI should do 3 or 4 times will make it very clear you're doing something wrong

---

## Questions.

⁉️ 🗣️

---

