import * as React from "react";
import * as Draft from "draft-js";
import Head from "next/head";
import { Formik, Form, FormikProps } from "formik";
import "isomorphic-fetch";
import * as Dwnxt from "downwrite";
import Autosaving from "../components/autosaving-interval";
import ExportMarkdown from "../components/export";
import WordCounter from "../components/word-count";
import { Button } from "../components/button";
import Loading from "../components/loading";
import { Input } from "../components/editor-input";
import { ToggleBox } from "../components/toggle-box";
import { PreviewLink } from "../components/entry-links";
import Editor from "../components/editor";
import TimeMarker from "../components/time-marker";
import { superConverter } from "../utils/responseHandler";
import { __IS_DEV__ } from "../utils/dev";
import useUpdateEntry, { IFields } from "../hooks/update-entry";
import * as InitialProps from "../utils/initial-props";

const EDITOR_COMMAND = "myeditor-save";

function EditUI(props: InitialProps.IEditProps) {
  const initialEditorState = Draft.EditorState.createWithContent(
    superConverter((props.post as Dwnxt.IPost).content)
  );

  const [initialFocus, setIntialFocus] = React.useState<boolean>(false);
  const [loaded, onSubmit] = useUpdateEntry(props.post, props.id);

  function onFocus(): void {
    setIntialFocus(true);
  }

  return !loaded ? (
    <Loading size={75} />
  ) : (
    <div className="Wrapper Wrapper--md">
      <Formik
        onSubmit={onSubmit}
        initialValues={{
          editorState: initialEditorState,
          title: props.post.title,
          publicStatus: props.post.public
        }}>
        {({
          values,
          handleChange,
          handleSubmit,
          setFieldValue
        }: FormikProps<IFields>) => (
          <>
            <Head>
              <title>{values.title} | Downwrite</title>
            </Head>
            {initialFocus && (
              <Autosaving
                title={values.title}
                duration={__IS_DEV__ ? 30000 : 120000}
                onUpdate={handleSubmit}
              />
            )}

            <Form style={{ padding: "0 8px" }}>
              <TimeMarker dateAdded={props.post.dateAdded} />
              <Input value={values.title} name="title" onChange={handleChange} />
              <aside className="UtilityBarContainer">
                <div className="UtilityBarItems">
                  <ToggleBox
                    label={value => (value ? "Public" : "Private")}
                    name="publicStatus"
                    value={values.publicStatus}
                    onChange={handleChange}
                  />
                  {!!values.publicStatus && (
                    <PreviewLink className="AltPreviewLink" id={props.id} />
                  )}
                </div>
                <div className="UtilityBarItems">
                  {!!values.editorState && (
                    <ExportMarkdown
                      editorState={values.editorState}
                      title={values.title}
                      date={props.post.dateAdded}
                    />
                  )}
                  <Button type="submit">Save</Button>
                </div>
              </aside>
              {!!values.editorState && (
                <Editor
                  editorState={values.editorState}
                  editorCommand={EDITOR_COMMAND}
                  onFocus={onFocus}
                  onSave={handleSubmit}
                  onChange={editorState => setFieldValue("editorState", editorState)}
                />
              )}
            </Form>
            {!!values.editorState && (
              <WordCounter editorState={values.editorState} />
            )}
          </>
        )}
      </Formik>
    </div>
  );
}

EditUI.getInitialProps = InitialProps.getInitialPost;

export default EditUI;
