import { NextPage } from "next";
import { useRouter } from "next/router";

import dynamic from "next/dynamic";
import { useCallback, useEffect } from "react";
import Head from "next/head";

import useSWR from "swr";

import { MixedCheckbox } from "@reach/checkbox";

import { Button } from "@components/button";
import { Loading } from "@components/loading";
import { Input } from "@components/editor-input";
import { PreviewLink } from "@components/entry-links";
import { TimeMarker } from "@components/time-marker";
import { WordCounter } from "@components/word-count";
import { ExportMarkdownButton } from "@components/export-markdown-button";
import { __IS_DEV__ } from "@utils/dev";

import { EditorAction, IEdit } from "@store/modules";
import { useDataFactory, useEnhancedReducer, useAutosaving } from "@hooks/index";
import { useEditor } from "@hooks/useEditor";

const Editor = dynamic(() => import("@components/editor"), {
  loading: () => <p>Loading the Editor</p>,
  ssr: false
});

const EditUI: NextPage = () => {
  const router = useRouter();
  const factory = useDataFactory(EditorAction);
  const [state, dispatch] = useEnhancedReducer<IEdit>({
    publicStatus: false,
    title: "",
    initialFocus: false,
    editorState: null
  });

  const { data, error, mutate } = useSWR([router.query.id], (id) =>
    factory.getEntry(id)
  );
  const loading = !data;

  useEffect(() => {
    if (!!data) {
      dispatch(factory.load(data.entry));
    }
  }, [data]);

  console.log(router.query, data);

  const editorProps = useEditor({
    setEditorState: (editorState) => dispatch({ editorState }),
    getEditorState: () => state.editorState
  });

  const handleSubmit = useCallback(async () => {
    const value = await factory.submit(router.query.id as string, state);

    if (value) {
      mutate(
        {
          entry: value.updateEntry
        },
        false
      );
    }
  }, [router.query]);

  useAutosaving(
    __IS_DEV__ ? 30000 : 120000,
    handleSubmit,
    `Autosaving “${state.title ?? "Your Entry"}”`
  );

  if (error) {
    return (
      <div>
        <h2>{error.name}</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  console.log(state);

  const handleExport = () =>
    factory.export({
      editorState: state.editorState,
      title: state.title,
      date: data.entry.dateAdded
    });

  return (
    <div data-testid="EDIT_ENTRY_CONTAINER" className="outer">
      <Head>
        <title>{state.title} | Downwrite</title>
      </Head>
      <div>
        <TimeMarker dateAdded={data?.entry?.dateAdded} />
        <Input
          value={state.title}
          name="title"
          data-testid="EDIT_ENTRY_TITLE_ENTRY"
          onChange={({ target }) => dispatch({ title: target.value })}
        />
        <aside>
          <div>
            <label>
              <MixedCheckbox
                name="publicStatus"
                checked={state.publicStatus}
                onChange={({ target }) => dispatch({ publicStatus: target.checked })}
              />
              <span>{state.publicStatus ? "Public" : "Private"}</span>
            </label>
          </div>
          {!!state.publicStatus && <PreviewLink id={router.query.id as string} />}
          <div className="button-group">
            {!!state.editorState && <ExportMarkdownButton onClick={handleExport} />}
            <Button
              type="submit"
              onClick={handleSubmit}
              data-testid="UPDATE_ENTRY_SUBMIT_BUTTON">
              Save
            </Button>
          </div>
        </aside>
        {!!state.editorState && <WordCounter editorState={state.editorState} />}
        {!!state.editorState && (
          <Editor
            onFocus={() => dispatch({ initialFocus: true })}
            onSave={handleSubmit}
            {...editorProps}
            editorState={state.editorState}
          />
        )}
      </div>
      <style jsx>{`
        .outer {
          width: 100%;
          max-width: 56rem;
          margin: 1rem auto;
        }

        aside {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--onyx-600);
        }

        .button-group {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default EditUI;
