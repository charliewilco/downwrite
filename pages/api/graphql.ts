import { ApolloServer, IResolvers } from "apollo-server-micro";
import * as jwt from "jsonwebtoken";
import uuid from "uuid/v4";
import Mongoose from "mongoose";
import { draftToMarkdown } from "markdown-draft-js";
import { IPost, PostModel, UserModel } from "../../server/models";
import { typeDefs } from "../../server/typeDefs";
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

interface IMutationCreateEntryVars {
  title: string;
  content: string;
}

const resolvers: IResolvers<any, IResolverContext> = {
  Query: {
    feed: async (_, args, { authScope, db }, info) => {
      const user = authScope.user;
      const posts: IPost[] = await PostModel.find({ user: { $eq: user } });
      // db.disconnect(() => console.log("Connection closed"));

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
      // db.disconnect(() => console.log("Connection closed"));
      return post;
    },
    preview: async (parent, args, { authScope, db }, info) => {
      const post: IPost = await PostModel.findOne({
        id: args.id
      });

      const user = await UserModel.findOne({ _id: post.user });

      const markdown = {
        id: args.id,
        author: {
          username: user.username,
          avatar: user.gradient || ["#FEB692", "#EA5455"]
        },
        content: draftToMarkdown(post.content, {
          entityItems: {
            LINK: {
              open: () => {
                return "[";
              },

              close: (entity: any) => {
                return `](${entity.data.url || entity.data.href})`;
              }
            }
          }
        }),
        title: post.title,
        dateAdded: post.dateAdded
      };

      return markdown;
    }
  },
  Mutation: {
    createEntry: async (
      parent,
      { title, content }: IMutationCreateEntryVars,
      { authScope, db },
      info
    ) => {
      const user = authScope.user;

      if (user) {
        const id = uuid();
        const date = new Date();

        const entry: Partial<IPost> = Object.assign(
          {},
          { title, content },
          {
            author: authScope.name,
            user,
            id,
            public: false,
            dateAdded: date,
            dateModified: date
          }
        );

        const post = await PostModel.create(entry);

        return post;
      }
    },

    deleteEntry: id => {}
  }
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
  },
  playground: {
    settings: {
      "editor.theme": "light",
      "schema.polling.enable": false
    }
  }
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default server.createHandler({ path: "/api/graphql" });
