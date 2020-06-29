import * as Draft from "draft-js";
import { v4 as uuid } from "uuid";
import { IPostModel } from "../../lib/models";

const uid = Math.floor(Math.random() * 678) + 1;

export const createdUser = {
  username: "user".concat(uid.toString()),
  email: "user".concat(uid.toString().concat("@email.com")),
  password: "Because1234"
};

export const createMockPost = (overides?: Partial<IPostModel>): IPostModel => {
  const post = Draft.EditorState.createWithContent(
    Draft.ContentState.createFromText("Hello")
  );
  const content = Draft.convertToRaw(post.getCurrentContent());
  const dateAdded = "2019-04-14T07:40:08.591Z";
  const id = uuid();

  return Object.assign(
    {},
    {
      title: "Something",
      id,
      dateAdded,
      dateModified: dateAdded,
      content,
      public: false,
      user: "someone",
      excerpt: "Something is happening here"
    },
    overides || {}
  ) as any;
};

export const createMockPosts = (count: number): IPostModel[] => {
  return Array(count || 1)
    .fill(null)
    .map(() => createMockPost({ title: "Mocked Posts" }));
};

export const createEditorState = (content?: string): Draft.EditorState => {
  const state = Draft.EditorState.createWithContent(
    Draft.ContentState.createFromText(content || "Hello")
  );

  return state;
};
