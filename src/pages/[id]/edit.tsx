import { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useCallback } from "react";
import useSWR from "swr";

import { FiEye, FiDownload } from "react-icons/fi";

import { CustomMeta } from "@components/custom-meta";
import { StickyContainer } from "@components/sticky-header";
import { VisibilityToggle } from "@components/visibility-toggle";
import { Loading } from "@components/loading";
import { EditorInput } from "@components/ui-input";
import { TimeMarker } from "@components/time-marker";
import { __IS_DEV__ } from "@shared/constants";

import { UpdateEntryState, IEdit } from "@data/modules";
import { useDataFactory, useEnhancedReducer, useAutosaving } from "@hooks/index";
import { useEditor, useWordCount } from "@hooks/useEditor";

const Editor = dynamic(() => import("@components/editor"), {
  loading: () => <p>Loading the Editor</p>,
  ssr: false
});

const EditUI: NextPage = () => {
  const router = useRouter();
  const dataSource = useDataFactory(UpdateEntryState);
  const [state, dispatch] = useEnhancedReducer<IEdit>({
    publicStatus: false,
    title: "",
    initialFocus: false,
    editorState: null
  });

  const { data, error, mutate } = useSWR([router.query.id, "edit"], () =>
    dataSource.getEntry(router.query.id as string)
  );
  const loading = !data;

  useEffect(() => {
    if (!!data) {
      const nextState = dataSource.load(data.entry);
      dispatch(nextState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dispatch]);

  const editorProps = useEditor({
    setEditorState: (editorState) => dispatch({ editorState }),
    getEditorState: () => state.editorState
  });

  const displayCount = useWordCount(state.editorState);

  const handleSubmit = useCallback(
    async (state: IEdit) => {
      const value = await dataSource.submit(router.query.id as string, state);

      if (value) {
        mutate(
          {
            entry: value.updateEntry
          },
          false
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.query, mutate]
  );

  useAutosaving(
    __IS_DEV__ ? 30000 : 120000,
    () => handleSubmit(state),
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

  const handleExport = () =>
    dataSource.export({
      editorState: state.editorState,
      title: state.title,
      date: data.entry.dateAdded
    });

  return (
    <div data-testid="EDIT_ENTRY_CONTAINER" className="outer">
      <CustomMeta
        title={state.title}
        path={(router.query.id as string).concat("/preview")}
      />
      <div>
        <StickyContainer debug>
          <div className="sticky-inner">
            <div className="meta">
              <TimeMarker dateAdded={data?.entry?.dateAdded} />
            </div>
            <div className="title">{state.title}</div>
            <div className="meta count">
              {!!state.editorState && <span>Word Count: {displayCount}</span>}
            </div>
          </div>
        </StickyContainer>

        <aside>
          <div className="check">
            <VisibilityToggle
              checked={state.publicStatus}
              onCheck={({ target }) => {
                dispatch({ publicStatus: target.checked });
              }}>
              <FiEye size={24} color="currentColor" />
            </VisibilityToggle>
            {!!state.publicStatus && (
              <Link href="/[id]/preview" as={`/${router.query.id}/preview`}>
                <a>Link</a>
              </Link>
            )}
          </div>

          <div className="button-group">
            {!!state.editorState && (
              <button
                title="export markdown"
                type="button"
                className="alt-button"
                onClick={handleExport}>
                <FiDownload size={24} />
              </button>
            )}
          </div>
        </aside>
        <EditorInput
          value={state.title}
          name="title"
          data-testid="EDIT_ENTRY_TITLE_ENTRY"
          onChange={({ target }) => dispatch({ title: target.value })}
        />

        {!!state.editorState && (
          <Editor
            onFocus={() => dispatch({ initialFocus: true })}
            onSave={() => handleSubmit(state)}
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

        .sticky-inner {
          padding-top: 0.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          font-family: var(--monospace);
        }

        .sticky-inner > .title {
          flex: 2;
          font-size: 1.125rem;
          text-align: center;
          font-weight: 300;
          font-family: var(--sans-serif);
        }

        .sticky-inner > .meta {
          flex: 1;
        }

        .sticky-inner > .count {
          text-align: right;
        }

        .check {
          user-select: none;
        }

        .check,
        aside {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .check {
          margin-right: 0.5rem;
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
