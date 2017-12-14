# Downwrite

A place to write.

---

So the idea here was simple build a simple markdown writing application. Markdown is a huge deal and all the cool tools kept getting shut down and naively, I thought, how hard can this really be? So I've had poorly designed iterations of this thing for every year on the year as one of these services got shut down. When [Canvas](undefined) shut down this last year, I started to get a little more serious about this idea.


---

During planning out some of my quarterly goals at my last job I decided to go a little more full-stack with Node and start to really work through the process of building a microservice. Since I'm never really one to learning languages and frameworks in the abstract, I decided to take up Downwrite as an excuse to build those microservice.

---

## Why Markdown

Markdown is probably the most efficient and universal tool for conveying syntax, semantics and structure across platforms.

Originally coined by [John Gruber (Daring Fireball)](undefined) it was originally conceived as a text to HTML and is the stable of static site generators, OSS and a fair amount of comment sections, notetaking applications.

These shortcuts are almost as ubiquitous as `cmd + b` for bold or `cmd + i` for italics.

---

> Bottomline: markdown is data. It is a method for describing semantics of data and is data itself.

---

## Highlights

---

### Micro Services

- Auth - using JWT and stateless authentication pattern
- Post Endpoints (Entries) - GET PUT POST DELETE for entries
- Export Service - markdown or json

---

### Routing

The URL is the state. This idea from Ember.js being a URL driven being what drives application state.

- `/` dashboard view or login
- `/new` a create a new post route
- `/:id/edit` defines a place to edit a given entry
- `/:id/preview` public preview for a given entry
- `/signout` uses react lifecycle to trash the token and redirect to the `/` route without the state of auth

---

### Draft

Using Draft.js was really a no-brainer, there's a rich set of plugins and uses cases are extendable the API is really approachable.

- Draft.js Plugins
- Really f**ked up on mobile

---

### CSS-in-JS

- CSS custom properties
- Aphrodite -> JSXStyle -> Glamor
- UI state is malleable, diffing strings is stupid.
- Font loading is hard. Maybe Google developers should solve that problem instead of harassing and baiting the React community on Twitter. You know, fix the fucking platform.
- A palette utility is a good idea
- Resets are a good idea. [Level.css](undefined) 

---

### Features

- Autosaving
- Night Mode
- Public posts
- Export and import markdown files
- Installable on Home Screen and caches the assets 

---

### In Progress Features

- Offline Mode
- Add Keywords to posts
- Search through posts
- SSR with Next.js and Express

---

## Takeaways

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

> Write tests. Not too many. Mostly integration. -- Guillermo Rauch, founder of Zeit and CloudUp, creator of Socket.io, mongoose.js, Slackin, Now, MooTools and whole pile of other shit

---

- Puppeteer and Jest are a match made in heaven. Writing asserts in the same way you would test a component is invaluable to your productivity.
- For writing unit tests with React, Components should be easy to test. Components should do one thing, have methods that are easy to spy on and mock return values.
- Writing snapshots should be the easiest test you write. It's a one liner.
- React Router components will kill your snapshots.
- Asking what this component or piece of UI should do 3 or 4 times will make it very clear you're doing something wrong

