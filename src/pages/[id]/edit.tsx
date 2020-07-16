import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Button } from "@components/button";
import Loading from "@components/loading";
import { Input } from "@components/editor-input";
import { ToggleBox } from "@components/toggle-box";
import { PreviewLink } from "@components/entry-links";
import TimeMarker from "@components/time-marker";
import { __IS_DEV__ } from "@utils/dev";
import { EditActions } from "@reducers/editor";
import { useEdit } from "@hooks/useEdit";

const Autosaving = dynamic(() => import("@components/autosaving-interval"));
const Editor = dynamic(() => import("@components/editor"));
const WordCounter = dynamic(() => import("@components/word-count"));
const ExportMarkdown = dynamic(() => import("@components/export"));

export default function EditUI() {
  const router = useRouter();

  const [{ loading, error, state, data, id }, actions] = useEdit(
    router.query.id! as string
  );

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
        <aside className="flex justify-between items-center mt-2 mx-0 mb-4 py-2">
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
}
