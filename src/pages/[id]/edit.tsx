import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import {
  RawDraftContentState,
  convertFromRaw,
  convertToRaw,
  EditorState
} from "draft-js";
import { NormalizedCacheObject } from "@apollo/client";
import { Button } from "@components/button";
import Loading from "@components/loading";
import { Input } from "@components/editor-input";
import { ToggleBox } from "@components/toggle-box";
import { PreviewLink } from "@components/entry-links";
import TimeMarker from "@components/time-marker";
import { __IS_DEV__ } from "@utils/dev";
import { updateEntryCache } from "@utils/cache";

import { initializeApollo } from "@lib/apollo";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import {
  EditDocument,
  IEditQuery,
  IEditQueryVariables,
  useEditQuery,
  useUpdateEntryMutation
} from "@utils/generated";
import { useEditReducer } from "@hooks/useEditReducer";
import { IAppState, useNotifications, NotificationType } from "@reducers/app";
import { EditActions } from "@reducers/editor";
import {
  useEditor,
  markdownToDraft,
  draftToMarkdown,
  imageLinkDecorators,
  prismHighlightDecorator,
  MultiDecorator,
  fixRawContentState
} from "../../editor";

const Autosaving = dynamic(() => import("@components/autosaving-interval"));
const Editor = dynamic(() => import("@components/editor"));
const WordCounter = dynamic(() => import("@components/word-count"));
const ExportMarkdown = dynamic(() => import("@components/export"));

interface IEditPageProps {
  initialAppState: IAppState;
  initialApolloState: NormalizedCacheObject;
  rawEditorState: RawDraftContentState;
  id: string;
}

type EditPageParams = {
  id: string;
};

type EditPageHandler = GetServerSideProps<IEditPageProps, EditPageParams>;

export const getServerSideProps: EditPageHandler = async ({ req, res, params }) => {
  const client = initializeApollo({}, { req, res });
  const id = params?.id!;

  const { data } = await client.query<IEditQuery, IEditQueryVariables>({
    query: EditDocument,
    variables: { id },
    context: { req, res }
  });

  const initialAppState = await getInitialStateFromCookie(req);
  const rawEditorState = fixRawContentState(markdownToDraft(data?.entry?.content!));

  return {
    props: {
      id,
      rawEditorState,
      initialAppState,
      initialApolloState: client.cache.extract()
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
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(
      convertFromRaw({
        blocks: [...props.rawEditorState.blocks],
        entityMap: {}
      }),
      decorators
    )
  );

  const getEditorState = () => editorState;
  const { loading, data, error } = useEditQuery({
    variables: {
      id: props.id
    }
  });

  const [, { addNotification }] = useNotifications();
  const [mutationFn] = useUpdateEntryMutation({
    update: updateEntryCache
  });

  const handleSubmit = useCallback(
    async (
      title: string,
      publicStatus: boolean,
      editorState: EditorState,
      id: string
    ) => {
      if (editorState !== null) {
        const raw = convertToRaw(editorState.getCurrentContent());
        const content = draftToMarkdown(raw, { preserveNewlines: true });
        await mutationFn({
          variables: {
            id,
            content,
            title: title,
            status: publicStatus
          }
        }).catch((err) => addNotification(err.message, NotificationType.ERROR));
      }
    },
    [mutationFn, addNotification]
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
            <ToggleBox
              label={(value) => (value ? "Public" : "Private")}
              name="publicStatus"
              value={state.publicStatus}
              onChange={() => dispatch({ type: EditActions.TOGGLE_PUBLIC_STATUS })}
            />
            {!!state.publicStatus && (
              <PreviewLink className="block text-xs leading-none" id={props.id} />
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
