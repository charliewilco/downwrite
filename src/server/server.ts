import { ApolloServer } from "apollo-server-micro";
import { ResolverContext } from "./context";
import { schema } from "./schema";

export const server = new ApolloServer({
  schema,
  context(_: ResolverContext) {
    return _;
  }
});
