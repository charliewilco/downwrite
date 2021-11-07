import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useFormik } from "formik";
import { EditorState } from "draft-js";
import { Uploader, IMarkdownConversion } from "@components/upload";
import { Input } from "@components/editor-input";
import {} from "@components/editor";
import { Button } from "@components/button";

import {
  useDataSource,
  useEnhancedReducer,
  useEditor,
  useDecorators,
  emptyContentState
} from "@hooks/index";
import { imageLinkDecorators, prismHighlightDecorator } from "../editor";

const Editor = dynamic(() => import("@components/editor"));

const NewEntryPage: NextPage = () => {
  const router = useRouter();
  const store = useDataSource();
  const decorators = useDecorators([imageLinkDecorators, prismHighlightDecorator]);
  const [state, dispatch] = useEnhancedReducer({
    title: "",
    editorState: EditorState.createWithContent(emptyContentState, decorators)
  });
  const editorProps = useEditor({
    getEditorState: () => state.editorState,
    setEditorState: (editorState) => dispatch({ editorState })
  });

  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: ""
    },
    async onSubmit(values) {
      const data = await store.create.create({
        ...state,
        ...values
      });

      if (!!data) {
        router.push(`/${data.createEntry?.id}/edit`);
      }
    }
  });

  const handleParsed = useCallback(
    ({ title, editorState }: IMarkdownConversion) => {
      setFieldValue("title", title);
      dispatch({ title, editorState });
    },
    [dispatch]
  );

  return (
    <form
      className="max-w-2xl px-2 pt-32 pb-0 mx-auto"
      onSubmit={handleSubmit}
      data-testid="NEW_EDITOR_FORM">
      <Head>
        <title>{values.title || "New"} | Downwrite</title>
      </Head>
      <Uploader onParsed={handleParsed}>
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
          editorState={state.editorState}
        />
      </Uploader>
    </form>
  );
};

export default NewEntryPage;
