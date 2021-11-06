import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";

import {
  RawDraftContentState,
  convertFromRaw,
  convertToRaw,
  EditorState
} from "draft-js";
import { MixedCheckbox } from "@reach/checkbox";

import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";
import { Button } from "@components/button";
import Loading from "@components/loading";
import { Input } from "@components/editor-input";
import { PreviewLink } from "@components/entry-links";
import TimeMarker from "@components/time-marker";
import { __IS_DEV__ } from "@utils/dev";

import { dwClient } from "@lib/client";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import { useEditReducer } from "@hooks/useEditReducer";
import { IAppState, useNotifications, NotificationType } from "@reducers/app";
import { EditActions } from "@reducers/editor";
import {
  useEditor,
  imageLinkDecorators,
  prismHighlightDecorator,
  MultiDecorator
} from "../../editor";

import { EditDocument } from "../../__generated__/client";
import { server } from "@lib/server";

const Autosaving = dynamic(() => import("@components/autosaving-interval"));
const Editor = dynamic(() => import("@components/editor"), {
  loading: () => <p>Loading the Editor</p>
});
const WordCounter = dynamic(() => import("@components/word-count"));
const ExportMarkdown = dynamic(() => import("@components/export"));

interface IEditPageProps {
  initialAppState: IAppState;
  rawEditorState: RawDraftContentState;
  id: string;
}

type EditPageParams = {
  id: string;
};

type EditPageHandler = GetServerSideProps<IEditPageProps, EditPageParams>;

export const getServerSideProps: EditPageHandler = async ({ req, res, params }) => {
  const response = await server.executeOperation(
    {
      query: EditDocument
    },
    { req, res }
  );
  const id = params?.id!;

  const initialAppState = await getInitialStateFromCookie(req);
  const rawEditorState = mdToDraftjs(response.data?.entry?.content!);

  return {
    props: {
      id,
      rawEditorState,
      initialAppState
    }
  };
};

const decorators = new MultiDecorator([
  imageLinkDecorators,
  prismHighlightDecorator
]);

const EditUI: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
  props
) => {
  const { data, error, mutate } = useSWR(props.id, (id) =>
    dwClient.Edit({
      id
    })
  );
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(
      convertFromRaw({
        blocks: [...props.rawEditorState.blocks],
        entityMap: {}
      }),
      decorators
    )
  );

  const loading = !data;

  const getEditorState = () => editorState;

  const [, { addNotification }] = useNotifications();

  const handleSubmit = useCallback(
    async (
      title: string,
      publicStatus: boolean,
      editorState: EditorState,
      id: string
    ) => {
      if (editorState !== null) {
        const raw = convertToRaw(editorState.getCurrentContent());
        const content = draftjsToMd(raw);
        await dwClient
          .UpdateEntry({
            id,
            content,
            title: title,
            status: publicStatus
          })
          .then((value) => {
            mutate(
              {
                entry: value.updateEntry
              },
              false
            );
          })
          .catch((err) => addNotification(err.message, NotificationType.ERROR));
      }
    },
    [addNotification]
  );

  const [state, dispatch] = useEditReducer(data);

  useEffect(() => {
    if (data && data.entry) {
      dispatch({ type: EditActions.INITIALIZE_EDITOR, payload: data.entry });
    }
  }, [data, dispatch]);

  const editorProps = useEditor({
    setEditorState,
    getEditorState
  });

  const onSubmit = () => {
    handleSubmit(state.title, state.publicStatus, editorState, props.id);
  };

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
      {state.initialFocus && (
        <Autosaving
          title={state.title}
          duration={__IS_DEV__ ? 30000 : 120000}
          onUpdate={onSubmit}
        />
      )}
      <div className="px-2">
        <TimeMarker dateAdded={data?.entry?.dateAdded} />
        <Input
          value={state.title}
          name="title"
          data-testid="EDIT_ENTRY_TITLE_ENTRY"
          onChange={({ target: { value } }) =>
            dispatch({ type: EditActions.UPDATE_TITLE, payload: value })
          }
        />
        <aside className="flex items-center justify-between py-2 mx-0 mt-2 mb-4">
          <div className="flex items-center">
            <div className="mr-4">
              <label className="text-xs flex items-center">
                <MixedCheckbox
                  name="publicStatus"
                  checked={state.publicStatus}
                  onChange={() =>
                    dispatch({ type: EditActions.TOGGLE_PUBLIC_STATUS })
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
            {!!editorState && (
              <ExportMarkdown
                editorState={editorState}
                title={state.title}
                date={data?.entry?.dateAdded}
              />
            )}
            <Button
              type="submit"
              onClick={onSubmit}
              data-testid="UPDATE_ENTRY_SUBMIT_BUTTON">
              Save
            </Button>
          </div>
        </aside>
        {!!editorState && (
          <Editor
            onFocus={() => dispatch({ type: EditActions.SET_INITIAL_FOCUS })}
            onSave={onSubmit}
            {...editorProps}
            editorState={editorState}
          />
        )}
      </div>
      {!!editorState && <WordCounter editorState={editorState} />}
    </div>
  );
};

export default EditUI;
