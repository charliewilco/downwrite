import * as React from "react";
import * as Draft from "draft-js";
import Head from "next/head";
import { Formik } from "formik";
import * as Dwnxt from "../types/downwrite";
import isEmpty from "lodash/isEmpty";
import sanitize from "@charliewilco/sanitize-object";
import "isomorphic-fetch";

import Autosaving from "../components/autosaving-interval";
import AutosavingNotification from "../components/autosaving-notification";
import ExportMarkdown from "../components/export";
import WordCounter from "../components/word-count";
import Button from "../components/button";
import Loading from "../components/loading";
import { Input } from "../components/editor-input";
import OuterEditor from "../components/outer-editor";
import Wrapper from "../components/wrapper";
import { ToggleBox } from "../components/toggle-box";
import PreviewLink from "../components/preview-link";
import Editor from "../components/editor";
import TimeMarker from "../components/time-marker";
import * as UtilityBar from "../components/utility-bar";
import * as API from "../utils/api";
import { getToken, superConverter } from "../utils/responseHandler";
import { __IS_DEV__ } from "../utils/dev";

interface IEditorState {
  initialFocus: boolean;
  loaded: boolean;
  dateModified: Date;
  editorState: Draft.EditorState;
}

interface IEditorProps {
  token: string;
  id: string;
  title: string;
  post: Dwnxt.IPost;
  route?: {};
}

const EDITOR_COMMAND = "myeditor-save";

export default class Edit extends React.Component<IEditorProps, IEditorState> {
  static async getInitialProps({ req, query }) {
    const { token } = getToken(req, query);
    const post = await API.getPost(query.id, { token });

    return {
      token,
      post,
      id: query.id
    };
  }

  static displayName = "EntryEdit";

  private readonly duration: number = __IS_DEV__ ? 30000 : 120000;

  public readonly state: IEditorState = {
    initialFocus: false,
    loaded: !isEmpty(this.props.post),
    dateModified: new Date(),
    editorState: Draft.EditorState.createWithContent(
      superConverter(this.props.post.content)
    )
  };

  private updatePostContent = async (values): Promise<void> => {
    const contentState: Draft.ContentState = values.editorState.getCurrentContent();
    const content = Draft.convertToRaw(contentState);

    const body = sanitize(this.props.post, ["_id", "__v"]);

    await API.updatePost(
      this.props.id,
      {
        ...body,
        title: values.title,
        public: values.publicStatus,
        content,
        dateModified: this.state.dateModified
      },
      { token: this.props.token }
    );
  };

  private onFocus = (): void => {
    this.setState({ initialFocus: true });
  };

  public render(): JSX.Element {
    const { loaded, initialFocus, editorState } = this.state;

    return !loaded ? (
      <Loading size={75} />
    ) : (
      <Wrapper sm>
        <Formik
          onSubmit={this.updatePostContent}
          initialValues={{
            editorState,
            title: this.props.post.title,
            publicStatus: this.props.post.public
          }}>
          {({
            values: { title, editorState, publicStatus },
            handleChange,
            handleSubmit,
            setFieldValue
          }) => (
            <>
              <Head>
                <title>{title} | Downwrite</title>
              </Head>
              <Autosaving
                duration={this.duration}
                onUpdate={initialFocus && handleSubmit}>
                <AutosavingNotification />
              </Autosaving>
              <OuterEditor>
                <TimeMarker dateAdded={this.props.post.dateAdded} />
                <Input value={title} name="title" onChange={handleChange} />
                <UtilityBar.Container>
                  <UtilityBar.Items>
                    <ToggleBox
                      label={value => (value ? "Public" : "Private")}
                      name="publicStatus"
                      value={publicStatus}
                      onChange={handleChange}
                    />
                    <PreviewLink id={this.props.id} publicStatus={publicStatus} />
                  </UtilityBar.Items>
                  <UtilityBar.Items>
                    {!!editorState && (
                      <ExportMarkdown
                        editorState={editorState}
                        title={title}
                        date={this.props.post.dateAdded}
                      />
                    )}
                    <Button type="submit">Save</Button>
                  </UtilityBar.Items>
                </UtilityBar.Container>
                {!!editorState && (
                  <Editor
                    editorState={editorState}
                    editorCommand={EDITOR_COMMAND}
                    onFocus={this.onFocus}
                    onSave={handleSubmit}
                    onChange={editorState =>
                      setFieldValue("editorState", editorState)
                    }
                  />
                )}
              </OuterEditor>
              {!!editorState && <WordCounter editorState={editorState} />}
            </>
          )}
        </Formik>
      </Wrapper>
    );
  }
}
