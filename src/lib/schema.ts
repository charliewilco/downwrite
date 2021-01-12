import { makeExecutableSchema } from "apollo-server-micro";
import typeDefs from "./schema.graphql";
import { resolvers } from "@lib/resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
