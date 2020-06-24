import { ApolloServer } from "apollo-server-micro";
import { schema } from "../../lib/schema";
import { ResolverContext } from "../../lib/queries";

const server = new ApolloServer({
  schema,
  context(context: ResolverContext) {
    return context;
  },
  playground: {
    settings: {
      "editor.fontFamily": "Operator Mono, monospace"
    }
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default server.createHandler({ path: "/api/graphql" });
