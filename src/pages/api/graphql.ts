import { ApolloServer } from "apollo-server-micro";
import { ResolverContext } from "@server/context";
import { schema } from "@server/schema";

const server = new ApolloServer({
  schema,
  context(_: ResolverContext) {
    return _;
  },
  introspection: true
});

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = server.createHandler({
  path: "/api/graphql"
});

export default handler;
