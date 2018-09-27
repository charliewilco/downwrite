# Next.js + Express

## The idea behind the example

Most of the times the default Next server will be enough but sometimes you want to run your own server to customize routes or other kind of the app behavior. Next provides a [Custom server and routing](https://github.com/zeit/next.js#custom-server-and-routing) so you can customize as much as you want.

Because the Next.js server is just a node.js module you can combine it with any other part of the node.js ecosystem. in this case we are using express to build a custom router on top of Next.

The example shows a server that serves the component living in `pages/a.js` when the route `/b` is requested and `pages/b.js` when the route `/a` is accessed. This is obviously a non-standard routing strategy. You can see how this custom routing is being made inside `server.js`.

### Routing

The URL is the state. 🗺️
This idea from Ember.js 🐹 being a URL driven being what drives application state.

- `/` dashboard view
- `/login` login view
- `/new` a create a new post route
- `/:id/edit` defines a place to edit a given entry
- `/:id/preview` public preview for a given entry
- `/signout` uses react lifecycle to trash the token and redirect to the `/` route without the state of auth

### Styling

- CSS custom properties
- Aphrodite -> JSXStyle -> Glamor -> styled-components
- UI state is malleable, diffing strings is stupid.
- Font loading is hard. Maybe Google developers should solve that problem instead of harassing and baiting the React community on Twitter. You know, fix the fucking platform.
- A palette utility is a good idea
- Resets are a good idea. [Level.css](https://github.com/charlespeters/level.css/)

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
