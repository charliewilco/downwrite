import * as React from "react";
import * as Draft from "draft-js";
import { Formik, Form, FormikProps } from "formik";
import Head from "next/head";
import Router from "next/router";
import * as Dwnxt from "downwrite";
import uuid from "uuid/v4";
import "isomorphic-fetch";
import { Input } from "../components/editor-input";
import { Button } from "../components/button";
import Upload from "../components/upload";
import Editor from "../components/editor";
import { AuthContext, IAuthContext } from "../components/auth";
import * as API from "../utils/api";

interface INewPostProps {
  offline?: boolean;
  token: string;
}

interface IFormikValues {
  title: string;
  editorState: Draft.EditorState;
}

const EDITOR_COMMAND = "create-new-post";

const EDITOR_SPACING: React.CSSProperties = {
  paddingTop: 128,
  paddingLeft: 4,
  paddingRight: 4,
  paddingBottom: 0
};

// const saveLocalDraft = (id: string, post: Object): void => {
//   localStorage.setItem("Draft " + id, JSON.stringify(post));
// };

function useCreatePost(): [string, (values: IFormikValues) => void] {
  const [error, setError] = React.useState<string>("");

  const { token } = React.useContext<IAuthContext>(AuthContext);
  const id = React.useRef(uuid());

  function createNewPost(values: IFormikValues) {
    const ContentState: Draft.ContentState = values.editorState.getCurrentContent();

    const body: Dwnxt.IPostCreation = {
      title: values.title.length > 0 ? values.title : `Untitled ${id.current}`,
      id: id.current,
      content: JSON.stringify(Draft.convertToRaw(ContentState)),
      dateAdded: new Date(),
      public: false
    };

    API.createPost(body, { token, host: document.location.host })
      .then(() =>
        Router.push({
          pathname: `/edit`,
          query: { id: id.current }
        })
      )
      .catch(err => setError(err.message));
  }

  return [error, (values: IFormikValues) => createNewPost(values)];
}

export default function NewEditor(props: INewPostProps) {
  const [error, createNewPost] = useCreatePost();

  const onSubmit = async (values: IFormikValues): Promise<void> => {
    createNewPost(values);
  };

  return (
    <Formik
      initialValues={{ title: "", editorState: Draft.EditorState.createEmpty() }}
      onSubmit={onSubmit}>
      {({
        values,
        setFieldValue,
        handleSubmit,
        handleChange
      }: FormikProps<IFormikValues>) => (
        <Form className="Wrapper Wrapper--sm" style={EDITOR_SPACING}>
          <Head>
            <title>{values.title ? values.title : "New"} | Downwrite</title>
          </Head>
          {error.length > 0 && <span className="f6 u-center">{error}</span>}
          <Upload
            onParsed={parsed => {
              setFieldValue("title", parsed.title);
              setFieldValue("editorState", parsed.editorState);
            }}>
            <Input
              name="title"
              placeholder="Untitled Document"
              value={values.title}
              onChange={handleChange}
            />
            <aside className="UtilityBarContainer">
              <div className="UtilityBarItems">
                {props.offline && <span>You're Offline Right Now</span>}
              </div>
              <div className="UtilityBarItems">
                <Button type="Submit">Add New</Button>
              </div>
            </aside>
            <Editor
              editorCommand={EDITOR_COMMAND}
              editorState={values.editorState}
              onChange={es => setFieldValue("editorState", es)}
              onSave={handleSubmit}
            />
          </Upload>
        </Form>
      )}
    </Formik>
  );
}
