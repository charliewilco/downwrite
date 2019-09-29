import { IResolvers, ApolloError, AuthenticationError } from "apollo-server-micro";
import jwt from "jsonwebtoken";
import uuid from "uuid/v4";
import bcrypt from "bcrypt";
import Mongoose from "mongoose";
import is from "@sindresorhus/is";
import { IUser, IPost, PostModel, UserModel } from "./models";
import { createMarkdownServer } from "./markdownTemplate";
import { Config } from "./server-config";

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
  id?: string;
  status?: boolean;
}

interface IMutationUserVars {
  email?: string;
  password: string;
  username: string;
}

interface ITokenUser {
  username: string;
  _id: string;
  admin?: boolean;
}

export function createToken(user: ITokenUser): string {
  let scopes: string;

  if (user.admin) {
    scopes = "admin";
  }

  const jwtConfig = {
    algorithm: "HS256",
    expiresIn: "180 days"
  };

  const data = {
    user: user._id,
    name: user.username,
    scope: scopes
  };

  return jwt.sign(data, Config.key, jwtConfig);
}

export const verifyUniqueUser = async ({
  username,
  email
}: Omit<IMutationUserVars, "password">) => {
  const user: IUser = await UserModel.findOne({
    $or: [{ email }, { username }]
  });

  if (user) {
    if (user.username === username) {
      throw new ApolloError("User name taken");
    }
    if (user.email === email) {
      throw new ApolloError("Email taken");
    }

    return;
  }

  return {
    username,
    email
  };
};

export const verifyCredentials = async ({
  password,
  username: identifier
}: Omit<IMutationUserVars, "email">) => {
  const user: IUser = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (user) {
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      return user;
    }
    throw new AuthenticationError("Incorrect password!");
  } else {
    throw new AuthenticationError("Incorrect username or email!");
  }
};

export const resolvers: IResolvers<any, IResolverContext> = {
  Query: {
    async feed(_, args, { authScope, db }, info) {
      const user = authScope.user;
      const posts: IPost[] = await PostModel.find({ user: { $eq: user } });

      return posts.map(post => {
        const md = createMarkdownServer(post.content);
        return {
          id: post.id,
          title: post.title,
          author: post.author,
          user: post.user.toString(),
          dateModified: post.dateModified,
          dateAdded: post.dateAdded,
          public: post.public,
          content: md,
          excerpt: md.trim().substr(0, 90)
        };
      });
    },
    async entry(parent, args, { authScope, db }, info) {
      const user = authScope.user;
      const post: IPost = await PostModel.findOne({
        id: args.id,
        user: { $eq: user }
      });

      const md = createMarkdownServer(post.content);
      return {
        id: post.id,
        title: post.title,
        author: post.author,
        user: post.user.toString(),
        dateModified: post.dateModified,
        dateAdded: post.dateAdded,
        public: post.public,
        content: md,
        excerpt: md.trim().substr(0, 90)
      };
    },
    async preview(parent, args, { authScope, db }, info) {
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
        content: createMarkdownServer(post.content),
        title: post.title,
        dateAdded: post.dateAdded
      };

      return markdown;
    }
  },
  Mutation: {
    async createEntry(
      parent,
      args: IMutationCreateEntryVars,
      { authScope, db },
      info
    ) {
      const user = authScope.user;

      if (user) {
        const id = uuid();
        const date = new Date();

        const entry: Partial<IPost> = Object.assign(
          {},
          { title: args.title, content: args.content },
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
    async updateEntry(
      parent,
      args: IMutationCreateEntryVars,
      { authScope, db },
      info
    ) {
      const user = authScope.user;
      // TODO: check if values are empty
      const entry = Object.assign(
        {},
        { user },
        {
          public: args.status,
          content: args.content,
          title: args.title,
          dateModifed: new Date()
        }
      );
      const post: IPost = await PostModel.findOneAndUpdate(
        { id: args.id, user: { $eq: user } },
        entry,
        {
          upsert: true
        }
      );
      // NOTE: This is not the updated entry object.
      return post;
    },
    async deleteEntry(parent, { id }, { authScope }, info) {
      const user = authScope.user;
      const post = await PostModel.findOneAndRemove({
        id,
        user: { $eq: user }
      });
      return post;
    },
    async createUser(parent, args: IMutationUserVars, {}, info) {
      const verifiedUser = await verifyUniqueUser({ ...args });

      if (!is.emptyObject(verifiedUser)) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(args.password, salt);
        const id = uuid();

        let user: IUser = await UserModel.create(
          Object.assign(
            {},
            {
              email: args.email,
              username: args.username,
              id,
              password: hash,
              admin: false
            }
          )
        );
        let token = createToken(user);
        return {
          user: {
            username: user.username,
            email: user.email
          },
          token
        };
      }
    },
    async authenticateUser(parent, args: IMutationUserVars, { authScope }, info) {
      const verifiedUser = await verifyCredentials({
        password: args.password,
        username: args.username
      });

      if (!is.emptyObject(verifiedUser)) {
        const token: string = createToken(verifiedUser);
        return {
          user: {
            username: verifiedUser.username,
            email: verifiedUser.email
          },
          token
        };
      }
    }
  }
};
