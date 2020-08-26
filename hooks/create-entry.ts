import * as React from "react";
import * as Draft from "draft-js";
import Router from "next/router";
import * as Dwnxt from "downwrite";
import { AuthContext, AuthContextType } from "../components/auth";
import { createPost } from "../utils/api";
import uuid from "uuid/v4";
import { useUINotifications, NotificationType } from "../reducers/notifications";

export interface IFields {
  title: string;
  editorState: Draft.EditorState;
}

export type CreateEntryHandler = (values: IFields) => void;

export default function useCreateEntry(): CreateEntryHandler {
  const { actions } = useUINotifications();

  const [{ token }] = React.useContext<AuthContextType>(AuthContext);
  const id: React.MutableRefObject<string> = React.useRef(uuid());

  function createNewPost(values: IFields) {
    const ContentState: Draft.ContentState = values.editorState.getCurrentContent();

    const body: Dwnxt.IPostCreation = {
      title: values.title.length > 0 ? values.title : `Untitled ${id.current}`,
      id: id.current,
      content: JSON.stringify(Draft.convertToRaw(ContentState)),
      dateAdded: new Date(),
      public: false
    };

    createPost(body, { token })
      .then(() =>
        Router.push({
          pathname: `/edit`,
          query: { id: id.current }
        })
      )
      .catch(err => actions.add(err.message, NotificationType.ERROR));
  }

  return (values: IFields) => createNewPost(values);
}
