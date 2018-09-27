### Testing

I need to stop f\*\*king around on this one and pick a direction.

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
