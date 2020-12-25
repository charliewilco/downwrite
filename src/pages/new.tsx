import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useFormik } from "formik";
import { useNewEntry, INewEditorValues } from "../hooks/useNewEntry";
import { useOffline } from "@hooks/useOffline";
import { IMarkdownConversion } from "@components/upload";
import { Input } from "@components/editor-input";
import { Button } from "@components/button";
// import { getInitialStateFromCookie } from "@lib/cookie-managment";
import {
  useEditor,
  useEditorState,
  useDecorators,
  defaultDecorators,
  emptyContentState
} from "../editor";

const Editor = dynamic(() => import("@components/editor"));
const Upload = dynamic(() => import("@components/upload"));

const EDITOR_COMMAND = "create-new-post";

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//   const initialAppState = await getInitialStateFromCookie(req);
//   return {
//     props: {
//       initialAppState
//     }
//   };
// };

const NewEntryPage: NextPage = () => {
  const [createNewPost] = useNewEntry();
  const isOffline = useOffline();
  const decorators = useDecorators(defaultDecorators);
  const [editorState, editorActions] = useEditorState({
    contentState: emptyContentState,
    decorators
  });

  const editorProps = useEditor(editorActions);

  function onSubmit(values: INewEditorValues): void {
    createNewPost(values.title, editorState);
  }

  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: ""
    },
    onSubmit
  });

  const onParsed = useCallback((parsed: IMarkdownConversion) => {
    setFieldValue("title", parsed.title);
    editorActions.setEditorState(parsed.editorState);
  }, []);

  return (
    <form className="max-w-2xl px-2 pt-32 pb-0 mx-auto" onSubmit={handleSubmit}>
      <Head>
        <title>{values.title ? values.title : "New"} | Downwrite</title>
      </Head>
      <Upload onParsed={onParsed}>
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
          onSave={() => handleSubmit()}
          {...editorProps}
          editorState={editorState}
        />
      </Upload>
    </form>
  );
};

export default NewEntryPage;
