import { GetServerSideProps } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRef } from "react";
import * as Draft from "draft-js";
import { useFormik } from "formik";
import { useOffline, useNewEntry, INewEditorValues } from "../hooks";
import { Input } from "../components/editor-input";
import { Button } from "../components/button";
import Upload from "../components/upload";
import { getInitialStateFromCookie } from "../lib/cookie-managment";

const Editor = dynamic(() => import("../components/editor"));

const EDITOR_COMMAND = "create-new-post";

export default function NewEntryPage() {
  const initialValues = useRef<INewEditorValues>({
    title: "",
    editorState: Draft.EditorState.createEmpty()
  });
  const [createNewPost] = useNewEntry();
  const isOffline = useOffline();

  function onSubmit(values: INewEditorValues): void {
    createNewPost(values);
  }

  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    enableReinitialize: true,
    initialValues: initialValues.current,
    onSubmit
  });

  return (
    <form
      className="Wrapper Wrapper--md"
      style={{
        paddingTop: 128,
        paddingLeft: 4,
        paddingRight: 4,
        paddingBottom: 0
      }}
      onSubmit={handleSubmit}>
      <Head>
        <title>{values.title ? values.title : "New"} | Downwrite</title>
      </Head>
      <Upload
        onParsed={parsed => {
          setFieldValue("title", parsed.title);
          setFieldValue("editorState", parsed.editorState);
        }}>
        <Input
          value={values.title}
          onChange={handleChange}
          name="title"
          placeholder="Untitled Document"
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
          editorCommand={EDITOR_COMMAND as any}
          editorState={values.editorState}
          onChange={editorState => setFieldValue("editorState", editorState)}
          onSave={handleSubmit}
        />
      </Upload>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const initialState = getInitialStateFromCookie(req);
  return {
    props: {
      initialState
    }
  };
};
