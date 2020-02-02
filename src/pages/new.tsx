import * as React from "react";
import * as Draft from "draft-js";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import Head from "next/head";
import { withApolloAuth } from "../utils/apollo-auth";
import { IFields, useNew } from "../hooks/create-entry";
import useOffline from "../hooks/offline";
import { Input } from "../components/editor-input";
import { Button } from "../components/button";
import Upload from "../components/upload";
import Loading from "../components/loading";

const Editor = dynamic(() => import("../components/editor"), {
  loading: () => <Loading size={50} />
});

const EDITOR_COMMAND = "create-new-post";

export const NewEditor = (): JSX.Element => {
  const initialValues = React.useRef<IFields>({
    title: "",
    editorState: Draft.EditorState.createEmpty()
  });
  const [createNewPost] = useNew();
  const isOffline = useOffline();

  function onSubmit(values: IFields): void {
    createNewPost(values);
  }

  const { values, setFieldValue, handleSubmit, handleChange } = useFormik({
    enableReinitialize: true,
    initialValues: initialValues.current,
    onSubmit
  });

  return (
    <React.Fragment>
      <form
        className="Wrapper Wrapper--md"
        style={{
          paddingTop: 128,
          paddingLeft: 4,
          paddingRight: 4,
          paddingBottom: 0
        }}
        onSubmit={handleSubmit}>
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
      </form>
    </React.Fragment>
  );
};
export default withApolloAuth(NewEditor, { ssr: false });
