import { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { EditorState } from "draft-js";
import { useDropzone } from "react-dropzone";
import { EditorInput } from "@components/ui-input";

import { useDataFactory, useEnhancedReducer } from "@hooks/index";
import { useEditor, useDecorators, emptyContentState } from "@hooks/useEditor";
import { imageLinkDecorators, prismHighlightDecorator } from "../editor";
import { CreateEntryState } from "@data/modules/create";
import { StickyContainer } from "@components/sticky-header";

const Editor = dynamic(() => import("@components/editor"));

const NewEntryPage: NextPage = () => {
  const router = useRouter();
  const dataSource = useDataFactory(CreateEntryState);
  const decorators = useDecorators([imageLinkDecorators, prismHighlightDecorator]);
  const [state, dispatch] = useEnhancedReducer({
    title: "",
    editorState: EditorState.createWithContent(emptyContentState, decorators)
  });
  const editorProps = useEditor({
    getEditorState: () => state.editorState,
    setEditorState: (editorState) => dispatch({ editorState })
  });

  const hasUnsavedChanges = useMemo(() => {
    const content = state.editorState.getCurrentContent();

    return content.hasText() || state.title !== "";
  }, [state]);

  const handleSubmit = useCallback(async () => {
    const content = state.editorState.getCurrentContent();

    if (content.hasText() || state.title !== "") {
      const data = await dataSource.create({
        ...state
      });

      if (!!data) {
        router.push(`/${data.createEntry?.id}/edit`);
      }
    }
  }, [state, router, dataSource]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      dataSource.onDrop(acceptedFiles).then(({ title, editorState }) => {
        dispatch({ title, editorState });
      });
    },
    [dataSource, dispatch]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      dispatch({ title: e.target.value });
    },
    [dispatch]
  );

  const { getRootProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: ["text/markdown", "text/x-markdown", "text/plain"]
  });

  return (
    <div className="outer" data-testid="NEW_EDITOR_FORM">
      <Head>
        <title>{state.title || "New"} | Downwrite</title>
      </Head>
      <div {...getRootProps()}>
        <EditorInput
          value={state.title}
          data-testid="NEW_ENTRY_TITLE_ENTRY"
          onChange={handleChange}
          name="title"
          placeholder="Untitled Document"
        />
        <StickyContainer debug>
          <div>
            {hasUnsavedChanges && (
              <button
                className="alt-button"
                onClick={handleSubmit}
                data-testid="NEW_ENTRY_SUBMIT_BUTTON">
                Save Changes
              </button>
            )}
          </div>
        </StickyContainer>
        <Editor
          onSave={() => handleSubmit()}
          {...editorProps}
          editorState={state.editorState}
        />
      </div>
      <style jsx>{`
        .outer {
          width: 100%;
          padding-top: 8rem;
          max-width: 56rem;
          margin: 1rem auto;
        }
      `}</style>
    </div>
  );
};

export default NewEntryPage;
