import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import useSWR from "swr";

import { MixedCheckbox } from "@reach/checkbox";

import { Button } from "@components/button";
import { Loading } from "@components/loading";
import { Input } from "@components/editor-input";
import { PreviewLink } from "@components/entry-links";
import { TimeMarker } from "@components/time-marker";
import { WordCounter } from "@components/word-count";
import { UIMarkdownExport } from "@components/export";
import { __IS_DEV__ } from "@utils/dev";

import { IEdit } from "@store/editor";
import {
  useDataSource,
  useOnce,
  useEnhancedReducer,
  useEditor,
  useAutosaving
} from "@hooks/index";

const Editor = dynamic(() => import("@components/editor"), {
  loading: () => <p>Loading the Editor</p>,
  ssr: false
});

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
  const [state, dispatch] = useEnhancedReducer<IEdit>({
    publicStatus: false,
    title: "",
    initialFocus: false,
    editorState: null
  });
  const store = useDataSource();

  const { data, error, mutate } = useSWR(props.id, (id) =>
    store.editor.getEntry(id)
  );
  const loading = !data;

  useOnce(() => {
    if (!!data) {
      dispatch(store.editor.load(data.entry));
    }
  }, [data]);

  const editorProps = useEditor({
    setEditorState: (editorState) => dispatch({ editorState }),
    getEditorState: () => state.editorState
  });

  const handleSubmit = useCallback(async () => {
    const value = await store.editor.submit(props.id, state);

    if (value) {
      mutate(
        {
          entry: value.updateEntry
        },
        false
      );
    }
  }, [props.id]);

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

  return (
    <div className="max-w-4xl mt-16 mx-auto" data-testid="EDIT_ENTRY_CONTAINER">
      <Head>
        <title>{state.title} | Downwrite</title>
      </Head>
      <div className="px-2">
        <TimeMarker dateAdded={data?.entry?.dateAdded} />
        <Input
          value={state.title}
          name="title"
          data-testid="EDIT_ENTRY_TITLE_ENTRY"
          onChange={({ target }) => dispatch({ title: target.value })}
        />
        <aside className="flex items-center justify-between py-2 mx-0 mt-2 mb-4">
          <div className="flex items-center">
            <div className="mr-4">
              <label className="text-xs flex items-center">
                <MixedCheckbox
                  name="publicStatus"
                  checked={state.publicStatus}
                  onChange={({ target }) =>
                    dispatch({ publicStatus: target.checked })
                  }
                />
                <span className="flex-1 ml-2 align-middle inline-block leading-none font-bold">
                  {state.publicStatus ? "Public" : "Private"}
                </span>
              </label>
            </div>
            {!!state.publicStatus && (
              <PreviewLink
                className="inline-block text-xs leading-none font-bold"
                id={props.id}
              />
            )}
          </div>
          <div className="flex items-center">
            {!!state.editorState && (
              <UIMarkdownExport
                editorState={state.editorState}
                title={state.title}
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
        {!!state.editorState && (
          <Editor
            onFocus={() => dispatch({ initialFocus: true })}
            onSave={handleSubmit}
            {...editorProps}
            editorState={state.editorState}
          />
        )}
      </div>
      {!!state.editorState && <WordCounter editorState={state.editorState} />}
    </div>
  );
};

export default EditUI;
