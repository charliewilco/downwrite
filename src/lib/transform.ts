import { createMarkdownServer } from "../markdown-template";
import { IMutationCreateEntryVars } from "./resolvers";
import { IEntry, IPreview } from "../generated";

export interface IUser {
  _id: string;
  email: string;
  username: string;
  gradient?: string[];
}

export interface IPost {
  id: string;
  title: string;
  author?: string;
  user: string;
  dateModified: Date;
  dateAdded: Date;
  public: true;
  content: string | Draft.RawDraftContentState;
  excerpt: string;
}

export class TransformResponses {
  public mergeUpdatedPost(args: IMutationCreateEntryVars, ref: IPost, id: string) {
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

  public transformPostToEntry(post: IPost): Omit<IEntry, "author"> {
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
  }

  public transformPostsToFeed(posts: IPost[]): Omit<IEntry, "author">[] {
    const feed = posts.map((post: IPost) => {
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

    return feed;
  }

  public transformMDToPreview(post: IPost, user: IUser): IPreview {
    const markdown = {
      id: post.id,
      author: {
        username: user.username,
        gradient: user.gradient || ["#FEB692", "#EA5455"],
        avatar: user.gradient || ["#FEB692", "#EA5455"]
      },
      content: createMarkdownServer(post.content),
      title: post.title,
      dateAdded: post.dateAdded,
      dateModified: post.dateModified
    };

    return markdown;
  }
}
