import * as React from "react";
import * as Draft from "draft-js";
import Head from "next/head";
import { NextContext } from "next";
import { Formik, Form, FormikProps } from "formik";
import isEmpty from "lodash/isEmpty";
import "isomorphic-fetch";
import * as Dwnxt from "downwrite";
import Autosaving from "../components/autosaving-interval";
import Toast from "../components/toast";
import ExportMarkdown from "../components/export";
import WordCounter from "../components/word-count";
import { Button } from "../components/button";
import Loading from "../components/loading";
import { Input } from "../components/editor-input";
import { ToggleBox } from "../components/toggle-box";
import PreviewLink from "../components/preview-link";
import Editor from "../components/editor";
import TimeMarker from "../components/time-marker";
import * as API from "../utils/api";
import { superConverter } from "../utils/responseHandler";
import { sanitize } from "../utils/sanitize";
import { __IS_DEV__ } from "../utils/dev";
import { authMiddleware } from "../utils/auth-middleware";
import { AuthContext, IAuthContext } from "../components/auth";

interface IEditorProps {
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

function EditUI(props: IEditorProps) {
  const { token } = React.useContext<IAuthContext>(AuthContext);
  const initialEditorState = Draft.EditorState.createWithContent(
    superConverter((props.post as Dwnxt.IPost).content)
  );

  const dateModified = new Date();
  const [loaded] = React.useState<boolean>(!isEmpty(props.post));
  const [initialFocus, setIntialFocus] = React.useState<boolean>(false);

  async function updatePostContent(values: IFields): Promise<void> {
    const contentState: Draft.ContentState = values.editorState.getCurrentContent();
    const content = Draft.convertToRaw(contentState);
    const { host } = document.location;

    const body = sanitize<ResponsePost>(props.post, ["_id", "__v"]) as Dwnxt.IPost;

    await API.updatePost(
      props.id,
      {
        ...body,
        title: values.title,
        public: values.publicStatus,
        content,
        dateModified
      },
      { token, host }
    );
  }

  function onFocus(): void {
    setIntialFocus(true);
  }

  return !loaded ? (
    <Loading size={75} />
  ) : (
    <div className="Wrapper Wrapper--sm">
      <Formik
        onSubmit={updatePostContent}
        initialValues={{
          editorState: initialEditorState,
          title: props.post.title,
          publicStatus: props.post.public
        }}>
        {({
          values,
          handleChange,
          handleSubmit,
          setFieldValue
        }: FormikProps<IFields>) => (
          <>
            <Head>
              <title>{values.title} | Downwrite</title>
            </Head>
            <Autosaving
              duration={__IS_DEV__ ? 30000 : 120000}
              onUpdate={initialFocus && handleSubmit}>
              <Toast>
                Autosaving <i>{values.title}</i>
              </Toast>
            </Autosaving>
            <Form className="OuterEditor">
              <TimeMarker dateAdded={props.post.dateAdded} />
              <Input value={values.title} name="title" onChange={handleChange} />
              <aside className="UtilityBarContainer">
                <div className="UtilityBarItems">
                  <ToggleBox
                    label={value => (value ? "Public" : "Private")}
                    name="publicStatus"
                    value={values.publicStatus}
                    onChange={handleChange}
                  />
                  <PreviewLink id={props.id} publicStatus={values.publicStatus} />
                </div>
                <div className="UtilityBarItems">
                  {!!values.editorState && (
                    <ExportMarkdown
                      editorState={values.editorState}
                      title={values.title}
                      date={props.post.dateAdded}
                    />
                  )}
                  <Button type="submit">Save</Button>
                </div>
              </aside>
              {!!values.editorState && (
                <Editor
                  editorState={values.editorState}
                  editorCommand={EDITOR_COMMAND}
                  onFocus={onFocus}
                  onSave={handleSubmit}
                  onChange={editorState => setFieldValue("editorState", editorState)}
                />
              )}
            </Form>
            {!!values.editorState && (
              <WordCounter editorState={values.editorState} />
            )}
          </>
        )}
      </Formik>
      <style jsx>
        {`
          .OuterEditor {
            padding: 0 8px;
          }
          .UtilityBarContainer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0 16px;
            padding: 8px 0;
          }
          .UtilityBarItems {
            display: flex;
            align-items: center;
          }
        `}
      </style>
    </div>
  );
}

EditUI.getInitialProps = async function(
  ctx: NextContext<{ id: string; token: string }>
) {
  const token = authMiddleware(ctx);

  let host: string;

  if (ctx.req) {
    const serverURL: string = ctx.req.headers.host;
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
};

export default EditUI;
