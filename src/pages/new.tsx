import * as React from "react";
import * as Draft from "draft-js";
import { Formik, Form } from "formik";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Cookies from "universal-cookie";
import useCreatePost, { IFields } from "../hooks/create-entry";
import useOffline from "../hooks/offline";
import { Input } from "../components/editor-input";
import { Button } from "../components/button";
import Upload from "../components/upload";
import Editor from "../components/editor";

const EDITOR_COMMAND: string = "create-new-post";

const EDITOR_SPACING: React.CSSProperties = {
  paddingTop: 128,
  paddingLeft: 4,
  paddingRight: 4,
  paddingBottom: 0
};

export const getServerSideProps: GetServerSideProps = async context => {
  const cookie = new Cookies(context.req.headers.cookie);
  const { DW_TOKEN } = cookie.getAll();

  return {
    props: {
      token: DW_TOKEN || null
    }
  };
};

export default function NewEditor(): JSX.Element {
  const [initialValues] = React.useState<IFields>({
    title: "",
    editorState: Draft.EditorState.createEmpty()
  });
  const createNewPost = useCreatePost();
  const isOffline = useOffline();

  function onSubmit(values: IFields): void {
    return createNewPost(values);
  }

  return (
    <React.Fragment>
      <Formik<IFields>
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize>
        {({ values, setFieldValue, handleSubmit, handleChange }) => (
          <Form className="Wrapper Wrapper--md" style={EDITOR_SPACING}>
            <Head>
              <title>{values.title ? values.title : "New"} | Downwrite</title>
            </Head>
            <Upload
              onParsed={parsed => {
                setFieldValue("title", parsed.title);
                setFieldValue("editorState", parsed.editorState);
              }}>
              <Input
                value={values.title}
                onChange={handleChange}
                name="title"
                placeholder="Untitled Document"
              />
              <aside className="UtilityBarContainer">
                <div className="UtilityBarItems">
                  {isOffline && <span>You're Offline Right Now</span>}
                </div>
                <div className="UtilityBarItems">
                  <Button type="submit">Add New</Button>
                </div>
              </aside>
              <Editor
                editorCommand={EDITOR_COMMAND}
                editorState={values.editorState}
                onChange={editorState => setFieldValue("editorState", editorState)}
                onSave={handleSubmit}
              />
            </Upload>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
}
