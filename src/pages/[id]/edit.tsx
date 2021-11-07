import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useEffect, useCallback, useRef } from "react";
import useSWR from "swr";

import { MixedCheckbox } from "@reach/checkbox";

import { Button } from "@components/button";
import Loading from "@components/loading";
import { Input } from "@components/editor-input";
import { PreviewLink } from "@components/entry-links";
import TimeMarker from "@components/time-marker";
import { __IS_DEV__ } from "@utils/dev";

import { useStore } from "@reducers/app";
import { useEditor } from "../../editor";

const Autosaving = dynamic(() => import("@components/autosaving-interval"));
const Editor = dynamic(() => import("@components/editor"), {
  loading: () => <p>Loading the Editor</p>
});
const WordCounter = dynamic(() => import("@components/word-count"));
const ExportMarkdown = dynamic(() => import("@components/export"));

interface IEditPageProps {
  id: string;
}

type EditPageHandler = GetServerSideProps<
  IEditPageProps,
  {
    id: string;
  }
>;

export const getServerSideProps: EditPageHandler = async ({ params }) => {
  const id = params?.id!;

  return {
    props: {
      id
    }
  };
};

const EditUI: NextPage<IEditPageProps> = (props) => {
  const loaded = useRef(false);
  const store = useStore();

  const { data, error, mutate } = useSWR(props.id, (id) =>
    store.editor.getEntry(id)
  );
  const loading = !data;

  useEffect(() => {
    if (!!data && !loaded.current) {
      store.editor.load(data.entry);
      loaded.current = true;
    }
  }, [data]);

  const handleSubmit = useCallback(async () => {
    const value = await store.editor.submit(props.id);
    mutate(
      {
        entry: value.updateEntry
      },
      false
    );
  }, [props.id]);

  useEffect(() => {
    if (data && data.entry) {
      store.editor.initialize(data.entry);
    }
  }, [data]);

  const editorProps = useEditor({
    setEditorState: store.editor.mutateEditorState,
    getEditorState: store.editor.getEditorState
  });

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

  return (
    <div className="max-w-4xl mt-16 mx-auto" data-testid="EDIT_ENTRY_CONTAINER">
      <Head>
        <title>{store.editor.title} | Downwrite</title>
      </Head>
      {store.editor.initialFocus && (
        <Autosaving
          title={store.editor.title}
          duration={__IS_DEV__ ? 30000 : 120000}
          onUpdate={handleSubmit}
        />
      )}
      <div className="px-2">
        <TimeMarker dateAdded={data?.entry?.dateAdded} />
        <Input
          value={store.editor.title}
          name="title"
          data-testid="EDIT_ENTRY_TITLE_ENTRY"
          onChange={({ target: { value } }) => store.editor.updateTitle(value)}
        />
        <aside className="flex items-center justify-between py-2 mx-0 mt-2 mb-4">
          <div className="flex items-center">
            <div className="mr-4">
              <label className="text-xs flex items-center">
                <MixedCheckbox
                  name="publicStatus"
                  checked={store.editor.publicStatus}
                  onChange={() => store.editor.toggleStatus()}
                />
                <span className="flex-1 ml-2 align-middle inline-block leading-none font-bold">
                  {store.editor.publicStatus ? "Public" : "Private"}
                </span>
              </label>
            </div>
            {!!store.editor.publicStatus && (
              <PreviewLink
                className="inline-block text-xs leading-none font-bold"
                id={props.id}
              />
            )}
          </div>
          <div className="flex items-center">
            {!!store.editor.editorState && (
              <ExportMarkdown
                editorState={store.editor.editorState}
                title={store.editor.title}
                date={data?.entry?.dateAdded}
              />
            )}
            <Button
              type="submit"
              onClick={handleSubmit}
              data-testid="UPDATE_ENTRY_SUBMIT_BUTTON">
              Save
            </Button>
          </div>
        </aside>
        {!!store.editor.editorState && (
          <Editor
            onFocus={store.editor.setFocus}
            onSave={handleSubmit}
            {...editorProps}
            editorState={store.editor.editorState}
          />
        )}
      </div>
      {!!store.editor.editorState && (
        <WordCounter editorState={store.editor.editorState} />
      )}
    </div>
  );
};

export default EditUI;
