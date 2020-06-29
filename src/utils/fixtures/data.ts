import { v4 as uuid } from "uuid";
import fakeMarkdown from "./fake-markdown";
import { IEntry, IPreview, IAuthor } from "../generated";
import { IUserModel } from "../../lib/models";

export class FixtureData {
  private fakePostContent: string = fakeMarkdown();
  public createMockEntry(title?: string, content?: string): IEntry {
    const dateAdded = new Date();

    return {
      ...this.createFakeTitle(title),
      dateAdded,
      dateModified: dateAdded,
      public: false,
      content: this.fakePostContent,
      excerpt: content
        ? content.trim().substr(0, 70)
        : this.fakePostContent.trim().substr(0, 70),
      user: "123",
      author: this.getFakeAuthor()
    };
  }

  public getFakeAuthor(): IAuthor {
    return {
      username: "test-user",
      gradient: []
    };
  }

  public createMockFeed(count: number): IEntry[] {
    const items = Array(count).fill(this.createMockEntry());
    return items;
  }

  public createFakeTitle(title?: string) {
    const id = uuid();
    return {
      id,
      title: title || "Entry #".concat(id)
    };
  }

  public createMockPreview(id?: string): IPreview {
    const preview = {
      ...this.createFakeTitle(),
      dateAdded: new Date(),
      content: this.fakePostContent,
      author: this.getFakeAuthor()
    };

    if (id) {
      preview.id = id;
    }

    return preview;
  }

  public createUser(): Partial<IUserModel> {
    return {
      username: "test-user",
      email: "test@test.com",
      _id: "123"
    };
  }
}
