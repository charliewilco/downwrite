import { ApolloServer } from "apollo-server-micro";
import { DownwriteAPI } from "./data-source";
import { MockAPI } from "./mock-data-source";
import { schema } from "./schema";
import { REST_ENDPOINT } from "../urls";

export const server = new ApolloServer({
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

export const testServer = new ApolloServer({
  schema,
  context() {
    return {
      token: "..."
    };
  },
  dataSources() {
    return {
      dwnxtAPI: new MockAPI()
    };
  }
});
