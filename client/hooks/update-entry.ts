import * as React from "react";
import * as Draft from "draft-js";
import * as Dwnxt from "downwrite";
import * as API from "../utils/api";
import { sanitize } from "../utils/sanitize";
import { AuthContext, IAuthContext } from "../components/auth";
import isEmpty from "lodash/isEmpty";

interface ResponsePost extends Dwnxt.IPost {
  _id: string;
  __v: string;
}

export interface IFields {
  editorState: Draft.EditorState;
  title: string;
  publicStatus: boolean;
}

export default function useUpdateEntry(
  post: Dwnxt.IPost,
  id: string
): [boolean, (v: IFields) => void] {
  const loaded = React.useRef<boolean>(!isEmpty(post));
  const { token } = React.useContext<IAuthContext>(AuthContext);
  const dateRef = React.useRef<Date>(new Date());

  async function updatePostContent(values: IFields): Promise<void> {
    const contentState: Draft.ContentState = values.editorState.getCurrentContent();
    const content = Draft.convertToRaw(contentState);
    const { host } = document.location;

    const body = sanitize<ResponsePost>(post, ["_id", "__v"]) as Dwnxt.IPost;

    await API.updatePost(
      id,
      {
        ...body,
        title: values.title,
        public: values.publicStatus,
        content,
        dateModified: dateRef.current
      },
      { token, host }
    );
  }

  return [loaded.current, (values: IFields) => updatePostContent(values)];
}
