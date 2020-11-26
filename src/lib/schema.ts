import { makeExecutableSchema } from "apollo-server-micro";
import { typeDefs } from "@lib/type-defs";
import { resolvers } from "@lib/resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
