import { ApolloServer } from "apollo-server-micro";
import jwt from "jsonwebtoken";
import Mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { resolvers } from "../../utils/resolvers";
import { Config } from "../../utils/server-config";
import { typeDefs } from "../../utils/typeDefs";

const prepareDB = async (): Promise<typeof Mongoose> => {
  Mongoose.Promise = global.Promise;
  const m = await Mongoose.connect(Config.dbCreds, { useNewUrlParser: true });

  Mongoose.set("useFindAndModify", true);

  const db = m.connection;

  db.on("error", () => {
    console.error("connection error");
  });

  db.once("open", () => {
    // tslint:disable: no-console
    console.info(`Connection with database succeeded.`);
    console.info("--- DOWNWRITE API ---");
  });

  return m;
};

let connection: typeof Mongoose;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({ req }) {
    const token: string = req.cookies.DW_TOKEN || req.headers.authorization;
    const authScope = jwt.decode(token);
    connection = await prepareDB();
    return {
      authScope,
      db: connection
    };
  },
  playground: {
    settings: {
      "editor.fontFamily": "Operator Mono, monospace",
      "editor.theme": "light"
      // "schema.polling.enable": false
    }
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

const handler = server.createHandler({ path: "/api/graphql" });

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  await handler(req, res).then(() => {
    if (connection) {
      connection.disconnect(() => console.log("Connection closed"));
    }
  });
};
