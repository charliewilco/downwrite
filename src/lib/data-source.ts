import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { IMutationCreateEntryVars, IMutationUserVars } from "./mutations";
import * as t from "./transform";
import uuid from "uuid/v4";
import { IEntry, IPreview } from "../utils/generated";
import { IPostModel, IUserModel } from "./models";

export interface ITokenContent {
  user: string;
  name: string;
  scope?: "admin";
}

export interface IContext {
  token?: string;
}

export interface IApiSource {
  getUserDetails(id?: string): Promise<IUserModel>;
  getPreview(id: string): Promise<IPreview>;
  getFeed(): Promise<Omit<IEntry, "author">[]>;
  getEntry(id: string): Promise<Omit<IEntry, "author">>;
  createPost(title: string, content: string): Promise<IEntry>;
  updatePost(id: string, args: IMutationCreateEntryVars): Promise<Partial<IEntry>>;
  removeEntry(id: string): Promise<Omit<IEntry, "author">>;
  createUser(args: IMutationUserVars): Promise<{ token: string }>;
  authenticateUser(user: string, password: string): Promise<{ token: string }>;
}

export class DownwriteAPI extends RESTDataSource<IContext> implements IApiSource {
  private normalize: any;
  constructor(url: string) {
    super();
    this.baseURL = url;
    this.normalize = t;
  }

  public willSendRequest(request: RequestOptions): void {
    if (this.context.token) {
      request.headers.set("Authorization", this.context.token);
    }
  }

  private async fetchPosts(): Promise<IPostModel[]> {
    return this.get("posts");
  }

  private async fetchPost(id: string): Promise<IPostModel> {
    return this.get(`posts/${id}`);
  }

  private async fetchMarkdownPreview(id: string): Promise<IPostModel> {
    return this.get(`posts/preview/${id}`);
  }

  public async getFeed(): Promise<Omit<IEntry, "author">[]> {
    const posts = await this.fetchPosts();
    const feed = this.normalize.transformPostsToFeed(posts);

    return feed;
  }

  public async getUserDetails(): Promise<IUserModel> {
    const user = await this.get("users");

    return user;
  }

  public async createPost(title: string, content: string): Promise<IEntry> {
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

  public async updatePost(
    id: string,
    args: IMutationCreateEntryVars
  ): Promise<Partial<IEntry>> {
    const ref = await this.fetchPost(id);
    const post = this.normalize.mergeUpdatedPost(args, ref, id);

    // NOTE: this is optimistic there needs to be a way
    await this.put(`posts/${id}`, post);

    return post;
  }

  public async getEntry(id: string): Promise<Omit<IEntry, "author">> {
    const post = await this.fetchPost(id);
    const entry = this.normalize.transformPostToEntry(post);

    return entry;
  }

  public async removeEntry(id: string): Promise<Omit<IEntry, "author">> {
    const post = await this.delete<IPostModel>(`posts/${id}`);
    const entry = this.normalize.transformPostToEntry(post);
    return entry;
  }

  public async getPreview(id: string): Promise<IPreview> {
    const markdown = await this.fetchMarkdownPreview(id);
    const user = await this.getUserDetails();
    const preview = this.normalize.transformMDToPreview(markdown, user);

    return preview;
  }

  public async createUser(args: IMutationUserVars) {
    const { id_token } = await this.post<{ id_token: string }>("users", args);
    return { token: id_token };
  }

  public async authenticateUser(user: string, password: string) {
    const { token } = await this.post<{ token: string }>("users/authenticate", {
      user,
      password
    });

    return { token };
  }
}
