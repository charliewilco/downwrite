import * as React from "react";
import * as Dwnxt from "../types/downwrite";
import Head from "next/head";
import * as Draft from "draft-js";
import isEmpty from "lodash/isEmpty";
import noop from "lodash/noop";
import debounce from "lodash/debounce";
import sanitize from "@charliewilco/sanitize-object";
import "universal-fetch";

import Autosaving from "../components/autosaving-notification";
import ExportMarkdown from "../components/export";
import WordCounter from "../components/word-count";
import Button from "../components/button";
import Loading from "../components/loading";
import Input from "../components/input";
import OuterEditor from "../components/outer-editor";
import Wrapper from "../components/wrapper";
import { PrivacyToggle } from "../components/privacy";
import PreviewLink from "../components/preview-link";
import Editor from "../components/editor";
import TimeMarker from "../components/time-marker";
import * as UtilityBar from "../components/utility-bar";
import { getToken, createHeader, superConverter } from "../utils/responseHandler";
import { POST_ENDPOINT } from "../utils/urls";

interface IEditorSt {
  autosaving: boolean;
  title: string;
  post: Dwnxt.IPost;
  loaded: boolean;
  updated: boolean;
  editorState: Draft.EditorState;
  dateModified: Date;
  publicStatus: boolean;
}

interface IEditorPr {
  token: string;
  location: Location;
  id: string;
  title: string;
  post: Dwnxt.IPost;
  editorState?: Draft.EditorState;
  route?: {};
}

const stateCreator = (post: Dwnxt.IPost) => ({
  autosaving: false,
  post,
  title: post.title || "",
  editorState: Draft.EditorState.createWithContent(superConverter(post.content)),
  updated: false,
  loaded: !isEmpty(post),
  unchanged: false,
  document: null,
  publicStatus: post.public,
  dateModified: new Date()
});

const EDITOR_COMMAND = "myeditor-save";

function saveKeyListener(e: React.KeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && Draft.KeyBindingUtil.hasCommandModifier(e)) {
    return EDITOR_COMMAND;
  }

  return Draft.getDefaultKeyBinding(e);
}

// TODO: Document this
// - Initial render
// - Rerouting
// - EditorState changes
// - Updating the post on the server

type Handler = "handled" | "not-handled";

export default class Edit extends React.Component<IEditorPr, IEditorSt> {
  static displayName = "EntryEdit";

  static async getInitialProps({ req, query }) {
    const { id } = query;
    const { token } = getToken(req, query);

    const post = await fetch(
      `${POST_ENDPOINT}/${id}`,
      createHeader("GET", token)
    ).then(r => r.json());
    const content = await superConverter(post.content);

    return {
      token,
      post,
      editorState: Draft.EditorState.createWithContent(content),
      id
    };
  }

  autoSave: any = () => noop();

  public readonly state = stateCreator(this.props.post);

  onChange = (editorState: Draft.EditorState) => {
    this.autoSave();
    this.setState({ editorState });
  };

  updatePost = (body: Dwnxt.IPost) => {
    const { id, token } = this.props;
    const config = createHeader("PUT", token);

    const payload = { ...config, body: JSON.stringify(body) };

    return fetch(`${POST_ENDPOINT}/${id}`, payload);
  };

  updatePostContent = (x: any) => {
    let { post, title, dateModified, editorState, publicStatus } = this.state;
    const contentState: Draft.ContentState = editorState.getCurrentContent();
    const content = Draft.convertToRaw(contentState);

    const postBody = sanitize(post, ["_id", "__v"]);

    const newPost = {
      ...postBody,
      title,
      public: publicStatus,
      content,
      dateModified
    };

    const updater = () => this.setState({ autosaving: false });
    return this.updatePost(newPost).then(() => setTimeout(updater, 7500));
  };

  updateTitle = ({ target }) =>
    this.setState({ title: (target as HTMLInputElement).value });

  updatePrivacy = () =>
    this.setState(({ publicStatus }) => ({ publicStatus: !publicStatus }));

  private handleKeyCommand = (
    command: string,
    editorState: Draft.EditorState
  ): Handler => {
    const newState = Draft.RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return "handled";
    }

    if (command === EDITOR_COMMAND) {
      this.updatePostContent({ autosave: false });
      return "handled";
    }

    return "not-handled";
  };

  componentDidMount() {
    // NOTE: Maybe this should only handle the fetch and not update the UI
    this.autoSave = debounce(() => {
      this.setState({ autosaving: true });
      this.updatePostContent({ autosave: true });
    }, 9000);
  }

  componentDidUpdate(nextProps) {
    if (nextProps.route !== this.props.route && this.autoSave.flush) {
      this.autoSave.flush();
    }
  }

  // NOTE:
  // Removes the no-op error when transitioning Location
  // Will need to account for any type of transitioning or auto updating other posts
  componentWillUnmount() {
    if (this.autoSave.flush) {
      this.autoSave.flush();
    }
  }

  render() {
    const {
      title,
      post,
      loaded,
      editorState,
      publicStatus,
      autosaving
    } = this.state;
    const { id } = this.props;

    return !loaded ? (
      <Loading size={75} />
    ) : (
      <>
        <Head>
          <title>{title} | Downwrite</title>
        </Head>
        {autosaving && <Autosaving />}
        <Wrapper sm>
          <OuterEditor>
            <TimeMarker dateAdded={post.dateAdded} />
            <Input value={title} onChange={this.updateTitle} />
            <UtilityBar.Container>
              <UtilityBar.Items>
                <PrivacyToggle
                  publicStatus={publicStatus}
                  onChange={this.updatePrivacy}
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
                <Button onChange={this.updatePostContent}>Save</Button>
              </UtilityBar.Items>
            </UtilityBar.Container>
            <div>
              {editorState !== null && (
                <Editor
                  editorState={editorState}
                  handleKeyCommand={this.handleKeyCommand}
                  keyBindingFn={saveKeyListener}
                  onChange={this.onChange}
                />
              )}
            </div>
          </OuterEditor>
        </Wrapper>
        {editorState !== null && <WordCounter editorState={editorState} />}
      </>
    );
  }
}
