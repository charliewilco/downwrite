import { useMemo } from "react";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Cookies from "universal-cookie";
import { TOKEN_NAME } from "./constants";

let apolloClient: ApolloClient<NormalizedCacheObject>;

const cookies = new Cookies();
function createApolloClient(token?: string) {
  const authLink = setContext((_, { headers }) => {
    if (typeof window !== "undefined") {
      return {
        headers: {
          ...headers,
          authorization: cookies.get(TOKEN_NAME)
        }
      };
    }

    return {
      headers: {
        ...headers,
        authorization: token ?? ""
      }
    };
  });

  const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql"

    // credentials: "same-origin"
  });
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true
  });
}

export function initializeApollo(
  initialState: NormalizedCacheObject | null = null,
  token?: string
) {
  const _apolloClient = apolloClient ?? createApolloClient(token);

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

export function useApollo(initialState: NormalizedCacheObject | null) {
  return useMemo(() => initializeApollo(initialState), [initialState]);
}
