import React from "react";
import Head from "next/head";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { ApolloProvider } from "@apollo/react-hooks";
import fetch from "isomorphic-unfetch";
import { NextPageContext } from "next";
import Cookies from "universal-cookie";
import { IncomingMessage } from "http";
import { GRAPHQL_ENDPOINT } from "./urls";

interface IApolloProps {
  apolloClient: ApolloClient<unknown>;
  apolloState?: NormalizedCacheObject;
}

interface IApolloPageContext extends NextPageContext {
  apolloClient: ApolloClient<unknown>;
}

interface IApolloPage<P = {}, IP = P> {
  (props: P): JSX.Element;
  defaultProps?: Partial<P>;
  displayName?: string;
  getInitialProps?(ctx: IApolloPageContext): Promise<Partial<IP>>;
}

function getToken(req?: IncomingMessage): string {
  let cookies;
  if (req) {
    cookies = new Cookies(req.headers.cookie);
  } else {
    cookies = new Cookies();
  }

  const { DW_TOKEN } = cookies.getAll();

  return DW_TOKEN;
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */
export function withApolloAuth<T = {}>(
  PageComponent: IApolloPage<T & IApolloProps>,
  { ssr = true } = {}
) {
  const WithApollo: IApolloPage<IApolloProps & T> = ({
    apolloClient,
    apolloState,
    ...pageProps
  }: IApolloProps & T) => {
    const client = apolloClient || initApolloClient(apolloState, { getToken });
    return (
      <ApolloProvider client={client}>
        <PageComponent {...(pageProps as any)} />
      </ApolloProvider>
    );
  };

  if (process.env.NODE_ENV !== "production") {
    // Find correct display name
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";

    // Warn if old way of installing apollo is used
    if (displayName === "App") {
      console.warn("This withApollo HOC only works with PageComponents.");
    }

    // Set correct display name for devtools
    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (
      ctx: IApolloPageContext
    ): Promise<IApolloProps & T | {}> => {
      const { AppTree } = ctx;

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apolloClient = (ctx.apolloClient = initApolloClient(
        {},
        {
          getToken: () => getToken(ctx.req)
        }
      ));

      const pageProps = PageComponent.getInitialProps
        ? await PageComponent.getInitialProps(ctx)
        : {};

      // Only on the server
      if (typeof window === "undefined") {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return {};
        }

        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import("@apollo/react-ssr");
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient
                }}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState
      };
    };
  }

  return WithApollo;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

interface IApolloHelper {
  getToken(): string;
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 */
function initApolloClient(initialState = {}, opts: IApolloHelper) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(initialState, opts);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createApolloClient(initialState, opts);
  }

  return apolloClient;
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 * @param  {Object} config
 */
function createApolloClient(
  initialState = {},
  opts: IApolloHelper
): ApolloClient<NormalizedCacheObject> {
  const fetchOptions: any = {};

  // If you are using a https_proxy, add fetchOptions with 'https-proxy-agent' agent instance
  // 'https-proxy-agent' is required here because it's a sever-side only module
  if (typeof window === "undefined") {
    if (process.env.https_proxy) {
      fetchOptions.agent = new (require("https-proxy-agent"))(
        process.env.https_proxy
      );
    }
  }

  const httpLink = new HttpLink({
    uri: GRAPHQL_ENDPOINT, // Server URL (must be absolute)
    credentials: "same-origin",
    fetch,
    fetchOptions
  });

  const authLink = setContext((request, { headers }) => {
    const token = opts.getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? token : ""
      }
    };
  });

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // Disables forceFetch on the server (so queries are only run once)
    link: authLink.concat(httpLink),
    cache: new InMemoryCache().restore(initialState)
  });
}
