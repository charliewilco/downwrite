import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useFormik } from "formik";
import { EditorState } from "draft-js";
import { useDropzone } from "react-dropzone";
import { Input } from "@components/editor-input";
import { Button } from "@components/button";

import { useDataSource, useDataFactory, useEnhancedReducer } from "@hooks/index";
import { useEditor, useDecorators, emptyContentState } from "@hooks/useEditor";
import { imageLinkDecorators, prismHighlightDecorator } from "../editor";
import { CreateEntry } from "@store/modules/create";

const Editor = dynamic(() => import("@components/editor"));

const NewEntryPage: NextPage = () => {
  const router = useRouter();
  const store = useDataSource();
  const factory = useDataFactory(CreateEntry);
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
      const data = await factory.create({
        ...state,
        ...values
      });

      if (!!data) {
        router.push(`/${data.createEntry?.id}/edit`);
      }
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    factory.onDrop(acceptedFiles).then(({ title, editorState }) => {
      setFieldValue("title", title);
      dispatch({ title, editorState });
    });
  }, []);

  const { getRootProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: ["text/markdown", "text/x-markdown", "text/plain"]
  });

  return (
    <form onSubmit={handleSubmit} data-testid="NEW_EDITOR_FORM">
      <Head>
        <title>{values.title || "New"} | Downwrite</title>
      </Head>
      <div {...getRootProps()}>
        <Input
          value={values.title}
          data-testid="NEW_ENTRY_TITLE_ENTRY"
          onChange={handleChange}
          name="title"
          placeholder="Untitled Document"
        />
        <aside>
          <div>{store.isOffline && <span>You're Offline Right Now</span>}</div>
          <div>
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
      </div>
    </form>
  );
};

export default NewEntryPage;
