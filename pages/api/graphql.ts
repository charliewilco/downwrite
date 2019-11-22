import { ApolloServer } from "apollo-server-micro";
import { importSchema } from "graphql-import";

import jwt from "jsonwebtoken";
import Mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { resolvers, IResolverContext } from "../../utils/resolvers";
import { IUser, IPost, PostModel, UserModel } from "../../utils/models";
import { MongoSource } from "../../utils/data-source";
import { prepareDB } from "../../utils/prepare-db";

const typeDefs = importSchema("pages/api/schema.graphql");

let connection: typeof Mongoose;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({ req }) {
    const token: string = req.cookies.DW_TOKEN || req.headers.authorization;
    const authScope = jwt.decode(token);
    connection = await prepareDB();
    return {
      authScope
    };
  },
  playground: {
    settings: {
      "editor.fontFamily": "Operator Mono, monospace"
      // "schema.polling.enable": false
    }
  },
  dataSources: () => {
    return {
      posts: new MongoSource<IResolverContext, IPost>(PostModel),
      users: new MongoSource<IResolverContext, IUser>(UserModel)
    };
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
