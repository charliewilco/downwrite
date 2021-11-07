import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useFormik } from "formik";
import { IMarkdownConversion } from "@components/upload";
import { Input } from "@components/editor-input";
import { Button } from "@components/button";

import { useEditor } from "../editor";
import { useStore } from "@reducers/app";
import { useRouter } from "next/router";

const Editor = dynamic(() => import("@components/editor"));
const Upload = dynamic(() => import("@components/upload"));

const NewEntryPage: NextPage = () => {
  const router = useRouter();
  const store = useStore();
  const editorProps = useEditor({
    getEditorState: store.create.getEditorState,
    setEditorState: store.create.mutateEditorState
  });

  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: ""
    },
    async onSubmit(values) {
      const data = await store.create.create(values.title);

      if (!!data) {
        router.push(`/${data.createEntry?.id}/edit`);
      }
    }
  });

  const handleParsed = useCallback((parsed: IMarkdownConversion) => {
    setFieldValue("title", parsed.title);
    store.create.mutateEditorState(parsed.editorState);
  }, []);

  return (
    <form
      className="max-w-2xl px-2 pt-32 pb-0 mx-auto"
      onSubmit={handleSubmit}
      data-testid="NEW_EDITOR_FORM">
      <Head>
        <title>{values.title || "New"} | Downwrite</title>
      </Head>
      <Upload onParsed={handleParsed}>
        <Input
          value={values.title}
          data-testid="NEW_ENTRY_TITLE_ENTRY"
          onChange={handleChange}
          name="title"
          placeholder="Untitled Document"
        />
        <aside className="flex items-center justify-between py-2 mx-0 mt-2 mb-4">
          <div className="flex items-center">
            {store.isOffline && <span>You're Offline Right Now</span>}
          </div>
          <div className="flex items-center">
            <Button type="submit" data-testid="NEW_ENTRY_SUBMIT_BUTTON">
              Add New
            </Button>
          </div>
        </aside>
        <Editor
          onSave={() => handleSubmit()}
          {...editorProps}
          editorState={store.create.editorState}
        />
      </Upload>
    </form>
  );
};

export default NewEntryPage;
