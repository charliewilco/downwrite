declare module "draft-js-markdown-shortcuts-plugin" {
  import { EditorPlugin } from "draft-js-plugins-editor";
  interface IMarkdownShortcutsOptions {
    insertEmptyBlockOnReturnWithModifierKey: boolean;
  }

  let createMarkdownShortcutsPlugin: (
    opts?: IMarkdownShortcutsOptions
  ) => EditorPlugin;

  export default createMarkdownShortcutsPlugin;
}
