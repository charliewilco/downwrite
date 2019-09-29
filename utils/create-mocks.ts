import * as Draft from "draft-js";
import uuid from "uuid/v4";

const post = Draft.EditorState.createWithContent(
  Draft.ContentState.createFromText("Hello")
);
const content = Draft.convertToRaw(post.getCurrentContent());

export const postTitle = "Some Post";
export const updatedTitle = "Updated Post";
export const createdPost = {
  title: postTitle,
  id: uuid(),
  content,
  dateAdded: Date.now(),
  public: false
};

const uid = Math.floor(Math.random() * 678) + 1;

export const createdUser = {
  username: "user".concat(uid.toString()),
  email: "user".concat(uid.toString().concat("@email.com")),
  password: "Because1234"
};
