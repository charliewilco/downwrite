import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { setContext } from "apollo-link-context";
import { HttpLink } from "apollo-link-http";
import Cookies from "universal-cookie";

function createLink() {
  return new HttpLink({
    uri: "/api/graphql",
    credentials: "same-origin"
  });
}

function getToken(): string {
  let cookies = new Cookies();

  const { DW_TOKEN } = cookies.getAll();

  return DW_TOKEN;
}

export function createApolloClient(
  initialState = {}
): ApolloClient<NormalizedCacheObject> {
  const token = getToken();
  const httpLink = createLink();

  const authLink = setContext((request, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: token ? token : ""
      }
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache().restore(initialState)
  });
}
