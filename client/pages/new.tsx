import * as React from "react";
import * as Draft from "draft-js";
import styled from "styled-components";
import { Formik, FormikProps } from "formik";
import Head from "next/head";
import Router from "next/router";
import uuid from "uuid/v4";
import "isomorphic-fetch";
import Wrapper from "../components/wrapper";
import Input from "../components/editor-input";
import Button from "../components/button";
import Upload from "../components/upload";
import Editor from "../components/editor";
import * as UtilityBar from "../components/utility-bar";
import * as API from "../utils/api";

interface INewPostSt {
  drafts: Array<any>;
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

const SpacedWrapper = styled(Wrapper)`
  padding-top: 128px;
`;

const EditorContainer = styled(Wrapper)`
  padding: 0 4px;
`;

const EDITOR_COMMAND = "create-new-post";

export default class NewEditor extends React.Component<INewPostProps, INewPostSt> {
  public readonly state = {
    id: uuid(),
    dateAdded: new Date(),
    error: "",
    drafts: []
  };

  static displayName = "NewPostEditor";

  saveLocalDraft = (id: string, post: Object): void =>
    localStorage.setItem("Draft " + id, JSON.stringify(post));

  onSubmit = async (values, actions) => {
    const { title, editorState } = values;
    const { token } = this.props;
    const { id, dateAdded } = this.state;
    const ContentState = editorState.getCurrentContent();
    const content = JSON.stringify(Draft.convertToRaw(ContentState));

    const body = {
      title: title.length > 0 ? title : `Untitled ${id}`,
      id,
      content,
      dateAdded,
      public: false
    };

    const post = await API.createPost(body, { token });

    if (!post.error) {
      return Router.push(`/${id}/edit`);
    } else {
      return this.setState({ error: post.message });
    }
  };

  render() {
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
          <SpacedWrapper sm>
            <Head>
              <title>{title.length > 0 ? title : "New"} | Downwrite</title>
            </Head>
            <EditorContainer sm>
              {error.length > 0 && <span className="f6 u-center">{error}</span>}
              <Upload
                upload={({ title, editorState }) => {
                  setFieldValue("title", title);
                  setFieldValue("editorState", editorState);
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
                  onChange={editorState => setFieldValue("editorState", editorState)}
                  onSave={handleSubmit}
                />
              </Upload>
            </EditorContainer>
          </SpacedWrapper>
        )}
      </Formik>
    );
  }
}
