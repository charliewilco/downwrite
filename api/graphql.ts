/* eslint-disable no-console */
import { ApolloServer } from "apollo-server-micro";
import { DownwriteAPI } from "../src/utils/graphql/data-source";
import { schema } from "../src/utils/graphql/schema";
import { REST_ENDPOINT } from "../src/utils/urls";

const server = new ApolloServer({
  schema,
  async context({ req }) {
    const token: string = req.cookies.DW_TOKEN || req.headers.authorization;
    return {
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
