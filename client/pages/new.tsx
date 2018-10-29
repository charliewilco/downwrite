import * as React from "react";
import * as Draft from "draft-js";
import styled from "styled-components";
import Head from "next/head";
import Router from "next/router";
import uuid from "uuid/v4";
import "universal-fetch";
import Wrapper from "../components/wrapper";
import Input from "../components/input";
import Button from "../components/button";
import Upload from "../components/upload";
import Editor from "../components/editor";
import * as UtilityBar from "../components/utility-bar";
import { POST_ENDPOINT } from "../utils/urls";
import { createHeader } from "../utils/responseHandler";

// const LazyEditor = dynamic(import('../components/editor'), { loading, ssr: false })

interface INewPostSt {
  drafts: Array<any>;
  saved: boolean;
  editorState: Draft.EditorState;
  id: string;
  title: string;
  error?: string;
  dateAdded: Date;
}

interface INewPostProps {
  offline?: boolean;
  token: string;
}

const SpacedWrapper = styled(Wrapper)`
  padding-top: 128px;
`;

const EditorContainer = styled(Wrapper)`
  padding: 0 4px;
`;

const EDITOR_COMMAND = "create-new-post";

function saveKeyListener(e: React.KeyboardEvent): string {
  if (e.keyCode === 83 && Draft.KeyBindingUtil.hasCommandModifier(e)) {
    return EDITOR_COMMAND;
  }
  return Draft.getDefaultKeyBinding(e);
}

export default class NewEditor extends React.Component<INewPostProps, INewPostSt> {
  public readonly state = {
    editorState: Draft.EditorState.createEmpty(),
    title: "",
    id: uuid(),
    dateAdded: new Date(),
    error: "",
    saved: false,
    drafts: []
  };

  static displayName = "NewPostEditor";

  addNew = async (body: Object) => {
    const { token } = this.props;
    const config = createHeader("POST", token);

    const post = await fetch(POST_ENDPOINT, {
      ...config,
      body: JSON.stringify(body)
    }).then(res => res.json());

    if (!post.error) {
      Router.push(`/${this.state.id}/edit`);
    } else {
      this.setState({ error: post.message });
    }
  };

  saveLocalDraft = (id: string, post: Object): void =>
    localStorage.setItem("Draft " + id, JSON.stringify(post));

  addNewPost = (offline?: boolean): Promise<any> | void => {
    let { id, title, editorState, dateAdded } = this.state;
    const ContentState = editorState.getCurrentContent();
    const content = JSON.stringify(Draft.convertToRaw(ContentState));

    const post: Object = {
      title: title.length > 0 ? title : `Untitled ${id}`,
      id,
      content,
      dateAdded,
      public: false
    };

    return offline ? this.saveLocalDraft(id, post) : this.addNew(post);
  };

  onChange = editorState => this.setState({ editorState });

  handleKeyCommand = (command: string, editorState) => {
    const { offline } = this.props;
    const newState = Draft.RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return "handled";
    }

    if (command === EDITOR_COMMAND) {
      this.addNewPost(offline);
      return "handled";
    }

    return "not-handled";
  };

  upload = (content: { title: string; editorState: Draft.EditorState }) =>
    this.setState(content);

  render() {
    const { error, editorState, title } = this.state;
    const { offline } = this.props;

    return (
      <>
        <Head>
          <title>{title.length > 0 ? title : "New"} | Downwrite</title>
        </Head>
        <SpacedWrapper sm>
          <EditorContainer sm>
            {error.length > 0 && <span className="f6 u-center">{error}</span>}
            <Upload upload={this.upload}>
              <Input
                placeholder="Untitled Document"
                value={title}
                onChange={e => this.setState({ title: e.target.value })}
              />
              <UtilityBar.Container>
                <UtilityBar.Items>
                  {offline && <span>You're Offline Right Now</span>}
                </UtilityBar.Items>
                <UtilityBar.Items>
                  <Button onClick={() => this.addNewPost(offline)}>Add New</Button>
                </UtilityBar.Items>
              </UtilityBar.Container>
              <Editor
                handleKeyCommand={this.handleKeyCommand}
                keyBindingFn={saveKeyListener}
                editorState={editorState}
                onChange={this.onChange}
              />
            </Upload>
          </EditorContainer>
        </SpacedWrapper>
      </>
    );
  }
}
