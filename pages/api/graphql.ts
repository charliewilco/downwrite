import { ApolloServer } from "apollo-server-micro";
import { DownwriteAPI, schema } from "../../utils/graphql";
import { REST_ENDPOINT } from "../../utils/urls";

const server = new ApolloServer({
  schema,
  async context({ req }) {
    const token: string = req.cookies.DW_TOKEN || req.headers.authorization;
    return {
      authScope,
      token
    };
  },
  playground: {
    settings: {
      "editor.fontFamily": "Operator Mono, monospace"
      // "schema.polling.enable": false
    }
  },
  dataSources() {
    return {
      dwnxtAPI: new DownwriteAPI(REST_ENDPOINT)
    };
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = server.createHandler({ path: "/api/graphql" });

export default handler;
