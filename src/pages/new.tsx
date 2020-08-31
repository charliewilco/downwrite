import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRef, useCallback } from "react";
import { EditorState, convertFromRaw } from "draft-js";
import { useFormik } from "formik";
import { useOffline, useNewEntry, INewEditorValues } from "../hooks";
import { Input } from "@components/editor-input";
import { Button } from "@components/button";
import { getInitialStateFromCookie } from "@lib/cookie-managment";

const Editor = dynamic(() => import("@components/editor"));
const Upload = dynamic(() => import("@components/upload"));

const EDITOR_COMMAND = "create-new-post";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const initialAppState = await getInitialStateFromCookie(req);
  return {
    props: {
      initialAppState
    }
  };
};

const emptyContentState = convertFromRaw({
  entityMap: {},
  blocks: [
    {
      text: "",
      depth: 0,
      key: "foo",
      type: "unstyled",
      inlineStyleRanges: [],
      entityRanges: []
    }
  ]
});

const NewEntryPage: NextPage = () => {
  const initialValues = useRef<INewEditorValues>({
    title: "",
    editorState: EditorState.createWithContent(emptyContentState)
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

  const onChange = useCallback(
    (editorState: EditorState) => setFieldValue("editorState", editorState),
    [setFieldValue]
  );

  return (
    <form className="max-w-2xl px-2 pt-32 pb-0 mx-auto" onSubmit={handleSubmit}>
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
        <aside className="flex items-center justify-between py-2 mx-0 mt-2 mb-4">
          <div className="flex items-center">
            {isOffline && <span>You're Offline Right Now</span>}
          </div>
          <div className="flex items-center">
            <Button type="submit">Add New</Button>
          </div>
        </aside>
        <Editor
          editorCommand={EDITOR_COMMAND as any}
          editorState={values.editorState}
          onChange={onChange}
          onSave={handleSubmit}
        />
      </Upload>
    </form>
  );
};

export default NewEntryPage;
