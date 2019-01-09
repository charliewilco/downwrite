import * as React from "react";
import * as Draft from "draft-js";
import Head from "next/head";
import { NextContext } from "next";
import { Formik, Form, FormikProps } from "formik";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";

import * as Dwnxt from "../types/downwrite";

import Autosaving from "../components/autosaving-interval";
import Toast from "../components/toast";
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
import { superConverter } from "../utils/responseHandler";
import { sanitize } from "../utils/sanitize";
import { __IS_DEV__ } from "../utils/dev";
import { authMiddleware } from "../utils/auth-middleware";

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

interface ResponsePost extends Dwnxt.IPost {
  _id: string;
  __v: string;
}

interface IFields {
  editorState: Draft.EditorState;
  title: string;
  publicStatus: boolean;
}

const EDITOR_COMMAND = "myeditor-save";

export default class Edit extends React.Component<IEditorProps, IEditorState> {
  static async getInitialProps(
    ctx: NextContext<{ id: string; token: string }>
  ): Promise<Partial<IEditorProps>> {
    const token = authMiddleware(ctx);

    let host: string;

    if (ctx.req) {
      const serverURL: string =
        ctx.req && (ctx.req.headers["X-Now-Deployment-Url"] as string);

      console.log(ctx.req.headers["X-Now-Deployment-Url"]);
      host = serverURL;
    }

    const post = (await API.getPost(ctx.query.id, {
      token,
      host
    })) as Dwnxt.IPost;

    return {
      token,
      post,
      id: ctx.query.id
    };
  }

  static displayName = "EntryEdit";

  private readonly duration: number = __IS_DEV__ ? 30000 : 120000;

  public readonly state: IEditorState = {
    initialFocus: false,
    loaded: !isEmpty(this.props.post),
    dateModified: new Date(),
    editorState: Draft.EditorState.createWithContent(
      superConverter((this.props.post as Dwnxt.IPost).content)
    )
  };

  private updatePostContent = async (values: IFields): Promise<void> => {
    const contentState: Draft.ContentState = values.editorState.getCurrentContent();
    const content = Draft.convertToRaw(contentState);
    const { host } = document.location;
    const { token } = this.props;

    const body = sanitize<ResponsePost>(this.props.post, [
      "_id",
      "__v"
    ]) as Dwnxt.IPost;

    await API.updatePost(
      this.props.id,
      {
        ...body,
        title: values.title,
        public: values.publicStatus,
        content,
        dateModified: this.state.dateModified
      },
      { token, host }
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
          }: FormikProps<IFields>) => (
            <>
              <Head>
                <title>{title} | Downwrite</title>
              </Head>
              <Autosaving
                duration={this.duration}
                onUpdate={initialFocus && handleSubmit}>
                <Toast>
                  Autosaving <i>{title}</i>
                </Toast>
              </Autosaving>
              <OuterEditor as={Form}>
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
