import * as React from "react";
import * as Draft from "draft-js";
import Head from "next/head";
import { Formik, Form } from "formik";
import { GetServerSideProps } from "next";
import Cookies from "universal-cookie";
import * as jwt from "jsonwebtoken";

import { getPost } from "@legacy/posts";
import { dbConnect } from "@legacy/util/db";
import Autosaving from "../components/autosaving-interval";
import ExportMarkdown from "../components/export";
import WordCounter from "../components/word-count";
import { Button } from "../components/button";
import Loading from "../components/loading";
import { Input } from "../components/editor-input";
import { ToggleBox } from "../components/toggle-box";
import { PreviewLink } from "../components/entry-links";
import Editor from "../components/editor";
import TimeMarker from "../components/time-marker";
import { superConverter } from "../utils/responseHandler";
import { __IS_DEV__ } from "../utils/dev";
import useUpdateEntry, { IFields } from "../hooks/update-entry";
import { IEditProps } from "../utils/initial-props";

type AuthedEditProps = IEditProps & { id: string };

export const getServerSideProps: GetServerSideProps<
  AuthedEditProps | { token?: string },
  { id: string }
> = async context => {
  await dbConnect();
  const { DW_TOKEN: token } = new Cookies(context.req.headers.cookie).getAll();

  const { user } = jwt.decode(token) as { user: string };
  const id = Array.isArray(context.query.id)
    ? context.query.id.join("")
    : context.query.id;

  const post = await getPost(user, id).then((p: any) => ({
    ...p,
    _id: p._id.toString(),
    user: p.user.toString(),
    title: p.title.toString(),
    content: JSON.parse(p.content),
    dateAdded: p.dateAdded.toString(),
    dateModified: p.dateModified ? p.dateModified.toString() : new Date().toString()
  }));

  if (token) {
    return {
      props: {
        token,
        id,
        title: post.title || "",
        post
      }
    };
  } else {
    return {
      props: { token: undefined }
    };
  }
};

const EDITOR_COMMAND = "myeditor-save";

function EditUI(props: AuthedEditProps) {
  console.log("EDIT PROPS", props);
  const initialEditorState = Draft.EditorState.createWithContent(
    superConverter(props.post.content)
  );

  const [initialFocus, setIntialFocus] = React.useState<boolean>(false);
  const [loaded, onSubmit] = useUpdateEntry(props.post, props.id);

  function onFocus(): void {
    setIntialFocus(true);
  }

  return !loaded ? (
    <Loading size={75} />
  ) : (
    <div className="Wrapper Wrapper--md">
      <Formik<IFields>
        onSubmit={onSubmit}
        initialValues={{
          editorState: initialEditorState,
          title: props.post.title,
          publicStatus: props.post.public
        }}>
        {({ values, handleChange, handleSubmit, setFieldValue }) => (
          <>
            <Head>
              <title>{values.title} | Downwrite</title>
            </Head>
            {initialFocus && (
              <Autosaving
                title={values.title}
                duration={__IS_DEV__ ? 30000 : 120000}
                onUpdate={handleSubmit}
              />
            )}

            <Form style={{ padding: "0 8px" }}>
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
                  {!!values.publicStatus && (
                    <PreviewLink className="AltPreviewLink" id={props.id} />
                  )}
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
    </div>
  );
}

export default EditUI;
