import { IResolvers } from "apollo-server-micro";
import { Query } from "@lib/queries";
import { Mutation } from "@lib/mutations";
import { ResolverContext } from "@lib/context";

export const resolvers: IResolvers<unknown, ResolverContext> = {
  Query,
  Mutation
};
