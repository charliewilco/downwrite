import * as React from "react";
import * as Draft from "draft-js";
import { Formik, Form, FormikActions, Field } from "formik";
import Head from "next/head";
import "isomorphic-unfetch";
import useCreatePost, { IFields } from "../hooks/create-entry";
import useOffline from "../hooks/offline";
import useLocalDrafts from "../hooks/local-draft";
import DraftList from "../components/drafts-list";
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
export default function NewEditor(props: INewPostProps): JSX.Element {
  const createNewPost = useCreatePost();
  const isOffline = useOffline();
  const { drafts, actions } = useLocalDrafts();

  function onSubmit(values: IFields, formActions: FormikActions<IFields>) {
    return isOffline ? actions.addDraft(values) : createNewPost(values);
  }

  return (
    <Formik<IFields>
      initialValues={{ title: "", editorState: Draft.EditorState.createEmpty() }}
      onSubmit={onSubmit}>
      {({ values, setFieldValue, handleSubmit, handleChange }) => (
        <Form className="Wrapper Wrapper--md" style={EDITOR_SPACING}>
          <Head>
            <title>{values.title ? values.title : "New"} | Downwrite</title>
          </Head>
          <Upload
            onParsed={parsed => {
              setFieldValue("title", parsed.title);
              setFieldValue("editorState", parsed.editorState);
            }}>
            <Field name="title" placeholder="Untitled Document" component={Input} />
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

            <DraftList drafts={drafts} onRemove={actions.removeDraft} />
          </Upload>
        </Form>
      )}
    </Formik>
  );
}
