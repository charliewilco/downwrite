import { IResolvers } from "apollo-server-micro";
import { Query } from "./queries";
import { Mutation } from "./mutations";
import { ResolverContext } from "./context";

export const resolvers: IResolvers<unknown, ResolverContext> = {
  Query,
  Mutation
};
