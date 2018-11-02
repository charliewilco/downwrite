declare module "draft-js-plugins-editor" {
  export interface PluginsEditorProps {
    plugins: any;
    handleKeyCommand: (c: string, e: Draft.EditorState) => "handled" | "not-handled";
    keyBindingFn: (e: any) => string;
  }

  export default class PluginsEditor extends React.Component<
    Draft.EditorProps & PluginsEditorProps,
    Draft.EditorState
  > {
    focus: () => void;
  }

  export function createEditorStateWithText(text: string): PluginsEditor;
  export function composeDecorators(...func: any[]): (...args: any[]) => any;
}
