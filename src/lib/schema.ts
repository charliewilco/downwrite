import { makeExecutableSchema } from "apollo-server-micro";
import { typeDefs } from "./type-defs";
import { resolvers } from "./resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
