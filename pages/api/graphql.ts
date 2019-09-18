import { ApolloServer, IResolvers } from "apollo-server-micro";
import * as jwt from "jsonwebtoken";
import Mongoose from "mongoose";
import { IPost, PostModel } from "../../server/models";
import { typeDefs } from "../../server/typedefs";
import { prepareDB } from "../../server/util/db";

interface ITokenContent {
  user: string;
  name: string;
  scope?: "admin";
}

interface IResolverContext {
  authScope?: ITokenContent;
  db: typeof Mongoose;
}

const resolvers: IResolvers<any, IResolverContext> = {
  Query: {
    feed: async (_, args, { authScope, db }, info) => {
      const user = authScope.user;
      const posts: IPost[] = await PostModel.find({ user: { $eq: user } });
      db.disconnect(() => console.log("Connection closed"));

      return posts;
    },
    entry: async (parent, args, { authScope, db }, info) => {
      console.log("args", args);
      const user = authScope.user;
      const post: IPost = await PostModel.findOne({
        id: args.id,
        user: { $eq: user }
      });
      console.log(post);
      db.disconnect(() => console.log("Connection closed"));
      return post;
    }
  }
  // Mutation: {
  //   createEntry: (content: string, title: string) => {},
  //   deleteEntry: id => {}
  // }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token: string = req.headers.authorization;
    const authScope = jwt.decode(token);
    const db = await prepareDB();
    return {
      authScope,
      db
    };
  }
});

export default server.createHandler({ path: "/api/graphql" });
