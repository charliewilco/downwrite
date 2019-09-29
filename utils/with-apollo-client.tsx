// tslint:disable: no-shadowed-variable
import * as React from "react";
import Head from "next/head";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import fetch from "isomorphic-unfetch";
import { NextPage, NextPageContext } from "next";
import { __IS_BROWSER__ } from "./dev";
import { cookies, ICookie } from "./auth-middleware";

let apolloClient: ApolloClient<unknown> = null;

const ENDPOINT = "http://localhost:3000/api/graphql";

interface IApolloProps {
  apolloClient: ApolloClient<unknown>;
  apolloState?: NormalizedCacheObject;
  token?: string;
}

interface IApolloPageContext extends NextPageContext {
  apolloClient: ApolloClient<unknown>;
}

interface IApolloHelper {
  getToken(): string;
}

interface IApolloPage<P = {}, IP = P> {
  (props: P): JSX.Element;
  defaultProps?: Partial<P>;
  displayName?: string;
  getInitialProps?(ctx: IApolloPageContext): Promise<Partial<IP>>;
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */
export function withApollo(PageComponent: NextPage, { ssr = true } = {}) {
  const WithApollo: IApolloPage<IApolloProps> = ({
    apolloClient,
    apolloState,
    token,
    ...pageProps
  }) => {
    const client =
      apolloClient ||
      initApolloClient(apolloState, {
        getToken() {
          return token;
        }
      });
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";

    if (displayName === "App") {
      console.warn("This withApollo HOC only works with PageComponents.");
    }

    WithApollo.displayName = `withApollo(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx: IApolloPageContext) => {
      const { AppTree } = ctx;
      let { DW_TOKEN: token } = cookies<ICookie>(ctx) as ICookie;

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient: ApolloClient<
        unknown
      > = (ctx.apolloClient = initApolloClient(
        {},
        {
          getToken: () => token
        }
      ));

      // Run wrapped getInitialProps methods
      let pageProps = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      // Only on the server:
      if (typeof window === "undefined") {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import("@apollo/react-ssr");
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                  token
                }}
              />,
              {}
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind();
        }
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

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
function initApolloClient(
  initialState: NormalizedCacheObject = {},
  options: IApolloHelper
) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(initialState, options);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createApolloClient(initialState, options);
  }

  return apolloClient;
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
function createApolloClient(
  initialState: NormalizedCacheObject = {},
  { getToken }: IApolloHelper
) {
  const authLink = setContext((_, { headers }) => {
    const token = getToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `token` : ""
      }
    };
  });
  const httpLink = new HttpLink({
    uri: ENDPOINT, // Server URL (must be absolute)
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
    fetch
  });
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    connectToDevTools: __IS_BROWSER__,
    ssrMode: !__IS_BROWSER__, // Disables forceFetch on the server (so queries are only run once), // Disables forceFetch on the server (so queries are only run once)
    link: authLink.concat(httpLink),
    cache: new InMemoryCache().restore(initialState)
  });
}
