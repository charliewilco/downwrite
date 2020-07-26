import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { RawDraftContentState } from "draft-js";
import { markdownToDraft } from "markdown-draft-js";
import { NormalizedCacheObject } from "@apollo/client";
import { Button } from "@components/button";
import Loading from "@components/loading";
import { Input } from "@components/editor-input";
import { ToggleBox } from "@components/toggle-box";
import { PreviewLink } from "@components/entry-links";
import TimeMarker from "@components/time-marker";
import { __IS_DEV__ } from "@utils/dev";
import { EditActions } from "@reducers/editor";
import { useEdit } from "@hooks/useEdit";
import { initializeApollo } from "@lib/apollo";
import { getInitialStateFromCookie } from "@lib/cookie-managment";
import { EditDocument, IEditQuery, IEditQueryVariables } from "@utils/generated";
import { IAppState } from "@reducers/app";

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

  const initialAppState = getInitialStateFromCookie(req);
  const rawEditorState = markdownToDraft(data?.entry?.content!);

  return {
    props: {
      id,
      rawEditorState,
      initialAppState,
      initialApolloState: client.cache.extract()
    }
  };
};

const EditUI: NextPage<InferGetServerSidePropsType<
  typeof getServerSideProps
>> = props => {
  const [{ loading, error, state, data, id }, actions] = useEdit(props.id);

  if (error) {
    return (
      <div>
        <h2>{error.name}</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (loading || state.editorState === null) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Head>
        <title>{state.title} | Downwrite</title>
      </Head>
      {state.initialFocus && (
        <Autosaving
          title={state.title}
          duration={__IS_DEV__ ? 30000 : 120000}
          onUpdate={actions.handleSubmit}
        />
      )}
      <div className="px-2">
        <TimeMarker dateAdded={data?.entry?.dateAdded} />
        <Input
          value={state.title}
          name="title"
          onChange={actions.handleTitleChange}
        />
        <aside className="flex items-center justify-between py-2 mx-0 mt-2 mb-4">
          <div className="flex items-center">
            <ToggleBox
              label={value => (value ? "Public" : "Private")}
              name="publicStatus"
              value={state.publicStatus}
              onChange={actions.handleStatusChange}
            />
            {!!state.publicStatus && (
              <PreviewLink className="block text-xs leading-none" id={id} />
            )}
          </div>
          <div className="flex items-center">
            {!!state.editorState && (
              <ExportMarkdown
                editorState={state.editorState}
                title={state.title}
                date={data?.entry?.dateAdded}
              />
            )}
            <Button type="submit" onClick={actions.handleSubmit}>
              Save
            </Button>
          </div>
        </aside>
        {!!state.editorState && (
          <Editor
            editorState={state.editorState}
            editorCommand={EditActions.EDITOR_COMMAND as any}
            onFocus={actions.handleFocus}
            onSave={actions.handleSubmit}
            onChange={actions.handleEditorChange}
          />
        )}
      </div>
      {!!state.editorState && <WordCounter editorState={state.editorState} />}
    </div>
  );
};

export default EditUI;
