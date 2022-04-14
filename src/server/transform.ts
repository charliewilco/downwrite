import { ApolloError } from "apollo-server-errors";
import { IPostModel, IUserModel } from "./models";
import { createMarkdownServer } from "../shared/markdown-template";
import { IEntry, IPreview } from "../__generated__/server";

const DEFAULT_GRADIENT = ["#FEB692", "#EA5455"];

const isUndefined = (value: unknown): value is undefined =>
  typeof value === "undefined";

export function transformPostsToFeed(posts: IPostModel[]): IEntry[] {
  const feed = posts.map((post) => {
    const md = createMarkdownServer(post.content);
    const user = post.user.toString();
    const dateAdded = isUndefined(post.dateAdded)
      ? new Date().toString()
      : post.dateAdded.toString();
    const dateModified = isUndefined(post.dateModified)
      ? new Date().toString()
      : post.dateModified.toString();
    return {
      id: post.id,
      title: post.title,
      author: { username: post.author, gradient: DEFAULT_GRADIENT },
      user,
      dateModified,
      dateAdded,
      public: post.public,
      content: md,
      excerpt: md.trim().substring(0, 90)
    };
  });

  return feed;
}

export function transformPostToEntry(post: IPostModel | null): IEntry {
  let md = ``;

  if (post === null) {
    throw new ApolloError("Post does not exist");
  }

  if (post.content !== null) {
    md = createMarkdownServer(post.content);
  }

  const dateAdded = isUndefined(post.dateAdded)
    ? new Date().toString()
    : post.dateAdded.toString();
  const dateModified = isUndefined(post.dateModified)
    ? new Date().toString()
    : post.dateModified.toString();

  const entry = {
    id: post.id,
    title: post.title,
    author: { username: post.author, gradient: DEFAULT_GRADIENT },
    user: post.user.toString(),
    dateModified,
    dateAdded,
    public: post.public,
    content: md,
    excerpt: md.trim().substring(0, 90)
  };

  return entry;
}

export function transformMDToPreview(post: IPostModel, user: IUserModel): IPreview {
  const dateAdded = isUndefined(post.dateAdded)
    ? new Date().toString()
    : post.dateAdded.toString();
  const dateModified = isUndefined(post.dateModified)
    ? new Date().toString()
    : post.dateModified.toString();

  const markdown = {
    id: post.id,
    author: {
      username: user.username,
      gradient: user.gradient || ["#FEB692", "#EA5455"],
      avatar: user.gradient || ["#FEB692", "#EA5455"]
    },
    content: createMarkdownServer(post.content),
    title: post.title,
    dateModified,
    dateAdded
  };

  return markdown;
}
