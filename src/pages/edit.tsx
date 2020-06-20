import * as React from "react";
import Head from "next/head";
import Autosaving from "../components/autosaving-interval";
import WordCounter from "../components/word-count";
import { Button } from "../components/button";
import Loading from "../components/loading";
import { Input } from "../components/editor-input";
import { ToggleBox } from "../components/toggle-box";
import { PreviewLink } from "../components/entry-links";
import TimeMarker from "../components/time-marker";
import { __IS_DEV__ } from "../utils/dev";
import { EditActions } from "../reducers/editor";
import { useEdit } from "../hooks";
import { useRouter } from "next/router";

const Editor = React.lazy(() => import("../components/editor"));

const ExportMarkdown = React.lazy(() => import("../components/export"));

export default function EditUI() {
  const router = useRouter();

  const [{ loading, error, state, data, id }, actions] = useEdit(
    router.query.id! as string
  );

  if (error) {
    return (
      <div>
        {error.name}
        <p>{error.message}</p>
      </div>
    );
  }

  if (loading || state.editorState === null) {
    return <Loading size={75} />;
  }

  return (
    <div className="Wrapper Wrapper--md">
      <React.Fragment>
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
        <div style={{ padding: "0 8px" }}>
          <TimeMarker dateAdded={data.entry.dateAdded} />
          <Input
            value={state.title}
            name="title"
            onChange={actions.handleTitleChange}
          />
          <aside className="UtilityBarContainer">
            <div className="UtilityBarItems">
              <ToggleBox
                label={value => (value ? "Public" : "Private")}
                name="publicStatus"
                value={state.publicStatus}
                onChange={actions.handleStatusChange}
              />
              {!!state.publicStatus && (
                <PreviewLink className="AltPreviewLink" id={id} />
              )}
            </div>
            <div className="UtilityBarItems">
              {!!state.editorState && (
                <ExportMarkdown
                  editorState={state.editorState}
                  title={state.title}
                  date={data.entry.dateAdded}
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
              editorCommand={EditActions.EDITOR_COMMAND}
              onFocus={actions.handleFocus}
              onSave={actions.handleSubmit}
              onChange={actions.handleEditorChange}
            />
          )}
        </div>
        {!!state.editorState && <WordCounter editorState={state.editorState} />}
      </React.Fragment>
    </div>
  );
}
