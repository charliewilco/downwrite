import * as React from "react";
import * as Draft from "draft-js";
import { Formik, Form, FormikProps } from "formik";
import Head from "next/head";
import useCreatePost, { IFields } from "../hooks/create-entry";
import useOffline from "../hooks/offline";
import "isomorphic-fetch";
import { Input } from "../components/editor-input";
import { Button } from "../components/button";
import Upload from "../components/upload";
import Editor from "../components/editor";

interface INewPostProps {
  token: string;
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

export default function NewEditor(props: INewPostProps): JSX.Element {
  const createNewPost = useCreatePost();
  const isOffline = useOffline();

  return (
    <Formik
      initialValues={{ title: "", editorState: Draft.EditorState.createEmpty() }}
      onSubmit={createNewPost}>
      {({
        values,
        setFieldValue,
        handleSubmit,
        handleChange
      }: FormikProps<IFields>) => (
        <Form className="Wrapper Wrapper--md" style={EDITOR_SPACING}>
          <Head>
            <title>{values.title ? values.title : "New"} | Downwrite</title>
          </Head>
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
                {isOffline && <span>You're Offline Right Now</span>}
              </div>
              <div className="UtilityBarItems">
                <Button type="submit">Add New</Button>
              </div>
            </aside>
            <Editor
              editorCommand={EDITOR_COMMAND}
              editorState={values.editorState}
              onChange={editorState => setFieldValue("editorState", editorState)}
              onSave={handleSubmit}
            />
          </Upload>
        </Form>
      )}
    </Formik>
  );
}
