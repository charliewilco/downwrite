import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { createMarkdownServer } from "../markdown-template";
import { IMutationCreateEntryVars, IMutationUserVars } from "./resolvers";
import uuid from "uuid/v4";

export interface ITokenContent {
  user: string;
  name: string;
  scope?: "admin";
}

export interface IContext {
  token?: string;
  authScope?: ITokenContent;
}

interface IUser {
  _id: string;
  email: string;
  username: string;
  gradient?: string[];
}

interface IPost {
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

export class DownwriteAPI extends RESTDataSource<IContext> {
  constructor(url: string) {
    super();
    this.baseURL = url;
  }

  public willSendRequest(request: RequestOptions): void {
    request.headers.set("Authorization", this.context.token);
  }

  public async fetchPosts(): Promise<IPost[]> {
    return this.get("posts");
  }

  public async fetchPost(id: string): Promise<IPost> {
    return this.get(`posts/${id}`);
  }

  public async getFeed() {
    const posts = await this.fetchPosts();
    const feed = this.transformPostsToFeed(posts);

    return feed;
  }

  public transformPostToEntry(post: IPost) {
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

  public transformPostsToFeed(posts: IPost[]) {
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

  public transformMDToPreview(post: IPost, user: IUser) {
    const markdown = {
      id: post.id,
      author: {
        username: user.username,
        avatar: user.gradient || ["#FEB692", "#EA5455"]
      },
      content: createMarkdownServer(post.content),
      title: post.title,
      dateAdded: post.dateAdded,
      dateModified: post.dateModified
    };

    return markdown;
  }

  public async getUserDetails(id?: string): Promise<IUser> {
    const user = await this.get("users");

    return user;
  }

  public async createPost(title: string, content: string) {
    const id = uuid();
    const date = new Date();

    const entry = Object.assign(
      {},
      {
        title,
        content,
        id,
        public: false,
        dateAdded: date,
        dateModified: date
      }
    );

    return this.post("posts", entry);
  }

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
      content,
      id,
      public: publicStatus,
      dateAdded: ref.dateAdded,
      dateModified: date
    };

    return post;
  }

  public async updatePost(id: string, args: IMutationCreateEntryVars) {
    const ref = await this.fetchPost(id);
    const post = this.mergeUpdatedPost(args, ref, id);

    // NOTE: this is optimistic there needs to be a way
    await this.put(`posts/${id}`, post);

    return post;
  }

  public async getEntry(id: string) {
    const post = await this.fetchPost(id);
    const entry = this.transformPostToEntry(post);

    return entry;
  }

  public async removeEntry(id: string) {
    return await this.delete(`posts/${id}`);
  }

  public async getPreview(id: string) {
    const markdown = await this.fetchMarkdownPreview(id);
    const user = await this.getUserDetails();
    const preview = this.transformMDToPreview(markdown, user);

    return preview;
  }

  public async fetchMarkdownPreview(id: string): Promise<IPost> {
    return this.get(`posts/preview/${id}`);
  }

  public async createUser(args: IMutationUserVars) {
    const { id_token } = await this.post("users", args);
    return { token: id_token };
  }

  public async authenticateUser(user: string, password: string) {
    const { token } = await this.post("users/authenticate", { user, password });

    return { token };
  }
}
