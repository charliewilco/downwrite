import { createMarkdownServer } from "../utils/markdown-template";
import { IMutationCreateEntryVars } from "./resolvers";
import { IEntry, IPreview } from "../utils/generated";
import { IPostModel, IUserModel } from "./models";
import { ApolloError } from "apollo-server-micro";

export interface IUser {
  _id: string;
  email: string;
  username: string;
  gradient?: string[];
}

export class TransformResponses {
  public mergeUpdatedPost(
    args: IMutationCreateEntryVars,
    ref: IPostModel,
    id: string
  ) {
    const date = new Date();

    const title = args.title
      ? ref.title !== args.title
        ? args.title
        : ref.title
      : ref.title;
    const content = args.content
      ? ref.content !== args.content
        ? args.content
        : ref.content
      : ref.content;
    const publicStatus = args.status
      ? ref.public === args.status
        ? ref.public
        : args.status
      : ref.public;

    const post = {
      title,
      content: createMarkdownServer(content),
      id,
      public: publicStatus,
      dateAdded: ref.dateAdded,
      dateModified: date
    };

    return post;
  }

  public transformPostToEntry(post: IPostModel): Omit<IEntry, "author"> {
    let md = ``;

    if (post.content !== null) {
      md = createMarkdownServer(post.content);
    }

    const entry = {
      id: post.id,
      title: post.title,
      author: post.author,
      user: post.user.toString(),
      dateModified: post.dateModified.toString(),
      dateAdded: post.dateAdded.toString(),
      public: post.public,
      content: md,
      excerpt: md.trim().substr(0, 90)
    };

    return entry;
  }

  public transformPostsToFeed(posts: IPostModel[]): Omit<IEntry, "author">[] {
    const feed = posts.map(post => {
      const md = createMarkdownServer(post.content);
      const user = post.user.toString();
      const dateAdded = post.dateAdded.toString();
      const dateModified = post.dateModified.toString();
      return {
        id: post.id,
        title: post.title,
        author: post.author,
        user,
        dateModified,
        dateAdded,
        public: post.public,
        content: md,
        excerpt: md.trim().substr(0, 90)
      };
    });

    return feed;
  }

  public transformMDToPreview(post: IPostModel, user: IUserModel): IPreview {
    const markdown = {
      id: post.id,
      author: {
        username: user.username,
        gradient: user.gradient || ["#FEB692", "#EA5455"],
        avatar: user.gradient || ["#FEB692", "#EA5455"]
      },
      content: createMarkdownServer(post.content),
      title: post.title,
      dateModified: post.dateModified.toString() || "",
      dateAdded: post.dateAdded.toString()
    };

    return markdown;
  }
}

export function transformPostsToFeed(posts: IPostModel[]): Omit<IEntry, "author">[] {
  const feed = posts.map(post => {
    const md = createMarkdownServer(post.content);
    const user = post.user.toString();
    const dateAdded = post.dateAdded.toString();
    const dateModified = post.dateModified.toString();
    return {
      id: post.id,
      title: post.title,
      author: post.author,
      user,
      dateModified,
      dateAdded,
      public: post.public,
      content: md,
      excerpt: md.trim().substr(0, 90)
    };
  });

  return feed;
}

export function transformPostToEntry(
  post: IPostModel | null
): Omit<IEntry, "author"> {
  let md = ``;

  if (post === null) {
    throw new ApolloError("Post does not exist");
  }

  if (post.content !== null) {
    md = createMarkdownServer(post.content);
  }

  const entry = {
    id: post.id,
    title: post.title,
    author: post.author,
    user: post.user.toString(),
    dateModified: post.dateModified.toString(),
    dateAdded: post.dateAdded.toString(),
    public: post.public,
    content: md,
    excerpt: md.trim().substr(0, 90)
  };

  return entry;
}

export function transformMDToPreview(post: IPostModel, user: IUserModel): IPreview {
  const markdown = {
    id: post.id,
    author: {
      username: user.username,
      gradient: user.gradient || ["#FEB692", "#EA5455"],
      avatar: user.gradient || ["#FEB692", "#EA5455"]
    },
    content: createMarkdownServer(post.content),
    title: post.title,
    dateModified: post.dateModified.toString() || "",
    dateAdded: post.dateAdded.toString()
  };

  return markdown;
}
