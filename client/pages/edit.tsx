import * as React from "react";
import * as Draft from "draft-js";
import Head from "next/head";
import { Formik } from "formik";
import * as Dwnxt from "../types/downwrite";
import isEmpty from "lodash/isEmpty";
import debounce from "lodash/debounce";
import sanitize from "@charliewilco/sanitize-object";
import "isomorphic-fetch";

import Autosaving from "../components/autosaving-interval";
import AutosavingNotification from "../components/autosaving-notification";
import ExportMarkdown from "../components/export";
import WordCounter from "../components/word-count";
import Button from "../components/button";
import Loading from "../components/loading";
import Input from "../components/editor-input";
import OuterEditor from "../components/outer-editor";
import Wrapper from "../components/wrapper";
import { ToggleBox } from "../components/toggle-box";
import PreviewLink from "../components/preview-link";
import Editor from "../components/editor";
import TimeMarker from "../components/time-marker";
import * as UtilityBar from "../components/utility-bar";
import * as API from "../utils/api";
import { getToken, superConverter } from "../utils/responseHandler";

interface IEditorSt {
  focused: boolean;
  loaded: boolean;
  dateModified: Date;
  editorState: Draft.EditorState;
}

interface IEditorPr {
  token: string;
  id: string;
  title: string;
  post: Dwnxt.IPost;
  route?: {};
}

const EDITOR_COMMAND = "myeditor-save";

export default class Edit extends React.Component<IEditorPr, IEditorSt> {
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

  duration: number = 9000;

  public readonly state = {
    focused: false,
    loaded: !isEmpty(this.props.post),
    dateModified: new Date(),
    editorState: Draft.EditorState.createWithContent(
      superConverter(this.props.post.content)
    )
  };

  updatePostContent = (values, actions) => {
    const { id, token, post } = this.props;
    const { editorState, title, publicStatus } = values;
    const contentState: Draft.ContentState = editorState.getCurrentContent();
    const content = Draft.convertToRaw(contentState);

    const postBody = sanitize(post, ["_id", "__v"]);

    const body = {
      ...postBody,
      title,
      public: publicStatus,
      content,
      dateModified: this.state.dateModified
    };

    return API.updatePost(id, body, { token });
  };

  onFocus = () => this.setState(state => ({ focused: !state.focused }));

  render() {
    const { loaded, focused, editorState } = this.state;
    const { id, post } = this.props;

    return !loaded ? (
      <Loading size={75} />
    ) : (
      <>
        <Wrapper sm>
          <Formik
            onSubmit={this.updatePostContent}
            initialValues={{
              editorState,
              title: post.title,
              publicStatus: post.public
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
                  onUpdate={() =>
                    focused && debounce(handleSubmit, this.duration / 3)
                  }>
                  <AutosavingNotification />
                </Autosaving>
                <OuterEditor>
                  <TimeMarker dateAdded={post.dateAdded} />
                  <Input value={title} name="title" onChange={handleChange} />
                  <UtilityBar.Container>
                    <UtilityBar.Items>
                      <ToggleBox
                        label={value => (value ? "Public" : "Private")}
                        name="publicStatus"
                        value={publicStatus}
                        onChange={handleChange}
                      />
                      <PreviewLink id={id} publicStatus={publicStatus} />
                    </UtilityBar.Items>
                    <UtilityBar.Items>
                      {editorState !== null && (
                        <ExportMarkdown
                          editorState={editorState}
                          title={title}
                          date={post.dateAdded}
                        />
                      )}
                      <Button type="submit">Save</Button>
                    </UtilityBar.Items>
                  </UtilityBar.Container>
                  {editorState !== null && (
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
                {editorState !== null && <WordCounter editorState={editorState} />}
              </>
            )}
          </Formik>
        </Wrapper>
      </>
    );
  }
}
