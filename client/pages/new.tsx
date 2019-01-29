import * as React from "react";
import * as Draft from "draft-js";
import styled from "styled-components";
import { Formik, Form, FormikProps } from "formik";
import Head from "next/head";
import Router from "next/router";
import * as Dwnxt from "downwrite";
import uuid from "uuid/v4";
import "isomorphic-fetch";
import Wrapper from "../components/wrapper";
import { Input } from "../components/editor-input";
import Button from "../components/button";
import Upload from "../components/upload";
import Editor from "../components/editor";
import * as UtilityBar from "../components/utility-bar";
import * as API from "../utils/api";

interface INewPostState {
  drafts?: Dwnxt.IPost[];
  id: string;
  error?: string;
  dateAdded: Date;
}

interface INewPostProps {
  offline?: boolean;
  token: string;
}

interface IFormikValues {
  title: string;
  editorState: Draft.EditorState;
}

const EditorContainer = styled(Wrapper)`
  padding: 128px 4px 0;
`;

const EDITOR_COMMAND = "create-new-post";

export default class NewEditor extends React.Component<
  INewPostProps,
  INewPostState
> {
  public readonly state: INewPostState = {
    id: uuid(),
    dateAdded: new Date(),
    error: "",
    drafts: []
  };

  public static displayName = "NewPostEditor";

  // private saveLocalDraft = (id: string, post: Object): void => {
  //   localStorage.setItem("Draft " + id, JSON.stringify(post));
  // };

  private onSubmit = async (values: IFormikValues): Promise<void> => {
    const { title, editorState } = values;
    const { token } = this.props;
    const { id, dateAdded } = this.state;
    const ContentState: Draft.ContentState = editorState.getCurrentContent();
    const content: string = JSON.stringify(Draft.convertToRaw(ContentState));
    const { host } = document.location;

    const body: Dwnxt.IPostCreation = {
      title: title.length > 0 ? title : `Untitled ${id}`,
      id,
      content,
      dateAdded,
      public: false
    };

    API.createPost(body, { token, host })
      .then(() =>
        Router.push({
          pathname: `/edit`,
          query: { id }
        })
      )
      .catch(err => this.setState({ error: err.message }));
  };

  public render(): JSX.Element {
    const { error } = this.state;
    const { offline } = this.props;

    return (
      <Formik
        initialValues={{ title: "", editorState: Draft.EditorState.createEmpty() }}
        onSubmit={this.onSubmit}>
        {({
          values: { editorState, title },
          setFieldValue,
          handleSubmit,
          handleChange
        }: FormikProps<IFormikValues>) => (
          <EditorContainer as={Form} sm>
            <Head>
              <title>{title ? title : "New"} | Downwrite</title>
            </Head>
            {error.length > 0 && <span className="f6 u-center">{error}</span>}
            <Upload
              onParsed={parsed => {
                setFieldValue("title", parsed.title);
                setFieldValue("editorState", parsed.editorState);
              }}>
              <Input
                name="title"
                placeholder="Untitled Document"
                value={title}
                onChange={handleChange}
              />
              <UtilityBar.Container>
                <UtilityBar.Items>
                  {offline && <span>You're Offline Right Now</span>}
                </UtilityBar.Items>
                <UtilityBar.Items>
                  <Button type="Submit">Add New</Button>
                </UtilityBar.Items>
              </UtilityBar.Container>
              <Editor
                editorCommand={EDITOR_COMMAND}
                editorState={editorState}
                onChange={es => setFieldValue("editorState", es)}
                onSave={handleSubmit}
              />
            </Upload>
          </EditorContainer>
        )}
      </Formik>
    );
  }
}
