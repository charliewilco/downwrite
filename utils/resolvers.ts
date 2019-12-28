import { IResolvers, ApolloError, AuthenticationError } from "apollo-server-micro";
import jwt from "jsonwebtoken";
import uuid from "uuid/v4";
import bcrypt from "bcrypt";
import is from "@sindresorhus/is";
import { IUser, IPost } from "./models";
import { createMarkdownServer } from "./markdown-template";
import { Config } from "./server-config";
import { MongoSource } from "./data-source";

/**
 * @deprecated
 */
interface ITokenContent {
  user: string;
  name: string;
  scope?: "admin";
}

/**
 * @deprecated
 */
export interface IResolverContext {
  authScope?: ITokenContent;
  dataSources: {
    posts: MongoSource<IResolverContext, IPost>;
    users: MongoSource<IResolverContext, IUser>;
  };
}

/**
 * @deprecated
 */
interface IMutationCreateEntryVars {
  title: string;
  content: string;
  id?: string;
  status?: boolean;
}

/**
 * @deprecated
 */
interface IMutationUserVars {
  email?: string;
  password: string;
  username: string;
}

/**
 * @deprecated
 */
interface ITokenUser {
  username: string;
  _id: string;
  admin?: boolean;
}

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
export const verifyUniqueUser = async (
  { username, email }: Omit<IMutationUserVars, "password">,
  userGetter: (...args: string[]) => Promise<IUser>
) => {
  const user: IUser = await userGetter(username, email);

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

/**
 * @deprecated
 */
export const verifyCredentials = async (
  { password, username: identifier }: Omit<IMutationUserVars, "email">,
  userGetter: (id: string) => Promise<IUser>
) => {
  const user: IUser = await userGetter(identifier);

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

/**
 * @deprecated
 */
export const resolvers: IResolvers<any, IResolverContext> = {
  Query: {
    async feed(_, args, { dataSources: { posts }, authScope }) {
      const user = authScope.user;
      const entries: IPost[] = await posts.getAll(user);

      return entries.map(post => {
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
    async entry(_, args, { authScope, dataSources: { posts } }) {
      const user = authScope.user;
      const post: IPost = await posts.find(args.id, user);

      let md = ``;

      if (post.content !== null) {
        md = createMarkdownServer(post.content);
      }

      const entry = {
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

      return entry;
    },
    async preview(_, { id }, { dataSources: { posts, users } }) {
      const post: IPost = await posts.find(id);

      const user = await users.findByRef(post.user);

      const markdown = {
        id,
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
      _,
      args: IMutationCreateEntryVars,
      { authScope, dataSources: { posts } }
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

        const post = await posts.create(entry);

        return post;
      }
    },
    async updateEntry(
      _,
      args: IMutationCreateEntryVars,
      { authScope, dataSources: { posts } }
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

      const post: IPost = await posts.update(entry, args.id, user);
      // NOTE: This is not the updated entry object.
      return post;
    },
    async deleteEntry(_, { id }, { authScope, dataSources: { posts } }) {
      const user = authScope.user;
      const post = await posts.remove(id, user);
      return post;
    },
    async createUser(
      _,
      { email, username, password }: IMutationUserVars,
      { dataSources: { users } }
    ) {
      const verifiedUser = await verifyUniqueUser({ email, username }, (id1, id2) =>
        users.findByCondition({
          $or: [{ email: id1 }, { username: id2 }]
        })
      );

      if (!is.emptyObject(verifiedUser)) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const id = uuid();

        let user: IUser = await users.create(
          Object.assign(
            {},
            {
              email,
              username,
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
    async authenticateUser(
      _,
      { password, username }: IMutationUserVars,
      { authScope, dataSources: { users } }
    ) {
      const verifiedUser = await verifyCredentials(
        {
          password,
          username
        },
        identifier =>
          users.findByCondition({
            $or: [{ email: identifier }, { username: identifier }]
          })
      );

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
