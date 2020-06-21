/* eslint-disable no-console */
import { RESTDataSource } from "apollo-datasource-rest";
import { IApiSource, IContext } from "./data-source";
import { FixtureData } from "../utils/fixtures/data";
import { IMutationUserVars, IMutationCreateEntryVars } from "./resolvers";

export class MockAPI extends RESTDataSource<IContext> implements IApiSource {
  private data = new FixtureData();
  public async getUserDetails() {
    return this.data.createUser();
  }
  public async getEntry(id: string) {
    return this.data.createMockEntry(id);
  }
  public async getFeed() {
    return this.data.createMockFeed(12);
  }

  public async getPreview(id: string) {
    return this.data.createMockPreview(id);
  }

  public async createPost(title: string, content: string) {
    return this.data.createMockEntry(title, content);
  }

  public async updatePost(id: string, args: IMutationCreateEntryVars) {
    console.log(args);
    return this.data.createMockEntry(id);
  }
  public async removeEntry(id: string) {
    return this.data.createMockEntry(id);
  }
  public async createUser(args: IMutationUserVars): Promise<{ token: string }> {
    console.log(args);
    return {
      token: "..."
    };
  }
  public async authenticateUser(
    user: string,
    password: string
  ): Promise<{ token: string }> {
    console.log(user, password);

    return {
      token: "..."
    };
  }
}
