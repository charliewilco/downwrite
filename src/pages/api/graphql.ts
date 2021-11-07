import { ApolloServer } from "apollo-server-micro";
import { ResolverContext } from "@lib/context";
import { schema } from "@lib/schema";

const server = new ApolloServer({
  schema,
  context(_: ResolverContext) {
    return _;
  }
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
