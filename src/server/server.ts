import { createServer } from "@graphql-yoga/node";
import { ResolverContext } from "./context";
import { schema } from "./schema";

export const server = createServer({
  schema,
  context(_: ResolverContext) {
    return _;
  }
});
