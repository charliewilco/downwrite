import * as Draft from "draft-js";
import uuid from "uuid/v4";
import { IPost } from "../graphql/transform";

const uid = Math.floor(Math.random() * 678) + 1;

export const createdUser = {
  username: "user".concat(uid.toString()),
  email: "user".concat(uid.toString().concat("@email.com")),
  password: "Because1234"
};

export const createMockPost = (overides?: Partial<IPost>): IPost => {
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
      content,
      public: false
    },
    overides || {}
  );
};

export const createMockPosts = (count: number): IPost[] => {
  return Array(count || 1)
    .fill(null)
    .map(() => createMockPost({ title: "Mocked Posts" }));
};

export const createEditorState = (content: string): Draft.EditorState => {
  const state = Draft.EditorState.createWithContent(
    Draft.ContentState.createFromText("Hello")
  );

  return state;
};
