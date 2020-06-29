import { GraphQLSchema } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { typeDefs } from "./type-defs";
import { resolvers } from "./resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export interface IExecaSchema {
  schema: GraphQLSchema;
}
