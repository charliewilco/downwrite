import * as uuid from "uuid/v4";
import * as Draft from "draft-js";
import { IPost } from "types/downwrite";

export const createMockPost = (overides: Partial<IPost>): IPost => {
  const post = Draft.EditorState.createWithContent(
    Draft.ContentState.createFromText("Hello")
  );
  const content = Draft.convertToRaw(post.getCurrentContent());

  const id = uuid;

  return Object.assign(
    {},
    {
      title: "Something",
      id,
      dateAdded: Date.now(),
      content,
      public: false
    },
    overides
  );
};

export const createMockPosts = (count: number): IPost[] => {
  return Array(count || 1).fill(createMockPost({ title: "Mocked Posts" }));
};

export const createEditorState = (content: string): Draft.EditorState => {
  const state = Draft.EditorState.createWithContent(
    Draft.ContentState.createFromText("Hello")
  );

  return state;
};
