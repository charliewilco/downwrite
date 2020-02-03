import * as React from "react";
import Head from "next/head";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { NextPage, NextPageContext } from "next";
import { getToken } from "../cookie";
import { DownwriteAPI } from "../graphql/data-source";
import { REST_ENDPOINT } from "../urls";

let globalApolloClient: ApolloClient<any> = null;

interface IWithApolloProps {
  apolloClient: ApolloClient<unknown>;
  apolloState?: NormalizedCacheObject;
}

interface IApolloPageContext extends NextPageContext {
  apolloClient: ApolloClient<unknown>;
}

interface IWithApolloConfig {
  ssr: boolean;
}

type FilteredContext = Pick<NextPageContext, "req" | "res">;

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */
export function withApollo<T>(
  PageComponent: NextPage<any>,
  { ssr = true }: IWithApolloConfig
) {
  const WithApollo: NextPage<IWithApolloProps & T> = ({
    apolloClient,
    apolloState,
    ...pageProps
  }) => {
    const client = apolloClient || initApolloClient(undefined, apolloState);
    return (
      <ApolloProvider client={client}>
        <PageComponent {...(pageProps as T)} />
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

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient({
        res: ctx.res,
        req: ctx.req
      }));

      // Run wrapped getInitialProps methods
      let pageProps: any = {};
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
  ctx: FilteredContext | undefined,
  initialState?: NormalizedCacheObject
) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === "undefined") {
    return createApolloClient(ctx, initialState);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(ctx, initialState);
  }

  return globalApolloClient;
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
function createApolloClient(
  ctx: FilteredContext | {} = {},
  initialState: NormalizedCacheObject = {}
) {
  const ssrMode = typeof window === "undefined";
  const cache = new InMemoryCache().restore(initialState);

  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    ssrMode,
    link: createIsomorphLink(ctx),
    cache
  });
}

function createIsomorphLink(ctx: FilteredContext | undefined) {
  const token = getToken(ctx.req);
  if (typeof window === "undefined") {
    const { SchemaLink } = require("apollo-link-schema");
    const { schema } = require("../graphql/schema");

    console.log(token, "TOKEN FROM ISOMORPHIC LINK");

    return new SchemaLink({
      schema,
      context: {
        token,
        dataSources() {
          return {
            dwnxtAPI: new DownwriteAPI(REST_ENDPOINT, token)
          };
        }
      }
    });
  } else {
    const { HttpLink } = require("apollo-link-http");

    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin"
    });
  }
}
