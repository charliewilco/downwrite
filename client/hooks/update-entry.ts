import * as React from "react";
import * as Draft from "draft-js";
import * as Dwnxt from "downwrite";
import * as API from "../utils/api";
import { sanitize } from "../utils/sanitize";
import { AuthContext, IAuthContext } from "../components/auth";

interface ResponsePost extends Dwnxt.IPost {
  _id: string;
  __v: string;
}

interface IFields {
  editorState: Draft.EditorState;
  title: string;
  publicStatus: boolean;
}

export default function useUpdateEntry(post: Dwnxt.IPost, id: string) {
  const [error] = React.useState<string>("");
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

  return [error, (values: IFields) => updatePostContent(values)];
}
