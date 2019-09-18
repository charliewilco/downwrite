import { HttpLink } from "apollo-link-http";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import fetch from "isomorphic-unfetch";
import { __IS_DEV__, __IS_BROWSER__ } from "./dev";

let apolloClient = null;

function create<T>(initialState?: NormalizedCacheObject): ApolloClient<T> {
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  const isBrowser = typeof window !== "undefined";
  return new ApolloClient<T>({
    connectToDevTools: isBrowser,
    ssrMode: !__IS_BROWSER__, // Disables forceFetch on the server (so queries are only run once)
    link: new HttpLink({
      uri: "http://localhost:3000/api/graphql", // Server URL (must be absolute)
      credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
      // Use fetch() polyfill on the server
      fetch: !__IS_BROWSER__ && fetch
    }),
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo<T>(initialState?: NormalizedCacheObject) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return create<T>(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create<T>(initialState);
  }

  return apolloClient;
}
