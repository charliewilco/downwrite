import { v4 as uuid } from "uuid";
import * as Draft from "draft-js";
import { IPost } from "downwrite";

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
