import { useMemo } from "react";
import { ApolloClient } from "apollo-client";
import { SchemaLink } from "apollo-link-schema";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { IExecaSchema } from "./schema";

let apolloClient: ApolloClient<NormalizedCacheObject>;

function createIsomorphLink(context?: any) {
  if (typeof window === "undefined") {
    // const { SchemaLink } = require("apollo-link-schema");
    const { schema }: IExecaSchema = require("./schema");
    return new SchemaLink({ schema, context });
  } else {
    const { HttpLink } = require("apollo-link-http");
    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin"
    });
  }
}

function createApolloClient(context?: any) {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: createIsomorphLink(context),
    cache: new InMemoryCache()
  });
}

export function initializeApollo(
  initialState: NormalizedCacheObject | null = null,
  context?: any
) {
  const _apolloClient = apolloClient ?? createApolloClient(context);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(
  initialState: NormalizedCacheObject | null,
  context?: any
) {
  const store = useMemo(() => initializeApollo(initialState, context), [
    initialState
  ]);
  return store;
}
