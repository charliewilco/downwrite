import { makeExecutableSchema } from "graphql-tools";
import { typeDefs, resolvers } from "./";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
