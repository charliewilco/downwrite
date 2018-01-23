Login is properly setting the token

The following need to reliably retrieve the token

* index
* edit
* new

using the `universal-cookies-middleware` neatly attaches the token to the header but i can't nest `getInitialProps`

## adding the token to the query helped

## Outstanding Issues Dec 25

on the other machine it's working sort of.

* need to pass down token, user, id as needed
* could a HOC actually help with this?
* what about nested `getInitialProps`?

---

## Outstanding Issues Dec 26

* `Router.push('/', { query: token })` isn't working right now on successful login...
* Linking on the client side is showing error before content loads. this seems relatively easy to fix. - Ref: [Getting strange 404 before page loads](https://github.com/zeit/next.js/issues/2208)

https://github.com/luisrudge/next.js-auth0
https://github.com/estrada9166/server-authentication-next.js
https://github.com/trandainhan/next.js-example-authentication-with-jwt
https://github.com/zeit/next.js/issues/2208

---

### Reverting Back to CRA

TODO:

I should really really curate the smarter changes from the Next.js rebuild. Off the top of my head that's this stuff.

1. ~~collect CSS from next.js branch~~
2. ~~grab fixes for empty title in new post~~
3. the state updating clean up in edit
4. ~~use Bolt instead of Lerna~~


#### Validate the Token Client-Side

In an instance of `componentWillMount` fetch a validation endpoint. If it doesn't respond with an error, set the state of `off` to be true. On the server, with the validation endpoint, use the `pre` method. If the `pre` method fails, it should error out on its own, and the controller can reply with whatever.

The non-optimal choice is to decode the token on the client, and check the expiration time against the current time.

Either implementation needs to handle the case for when a fetch request errors out. The user needs feedback. 

Or better option just handle the error