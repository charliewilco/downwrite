import { ApolloServer, Config } from "apollo-server-micro";
import type { ResolverContext } from "./context";
import { schema } from "./schema";

export const DownwriteConfig: Config = {
  schema,
  context(context: ResolverContext) {
    return context;
  },
  introspection: true
};

export const server = new ApolloServer(DownwriteConfig);
