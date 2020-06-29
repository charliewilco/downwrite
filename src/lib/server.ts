import { ApolloServer } from "apollo-server-micro";
import { schema } from "./schema";

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
  }
});

export const testServer = new ApolloServer({
  schema,
  context() {
    return {
      token: "..."
    };
  }
});
