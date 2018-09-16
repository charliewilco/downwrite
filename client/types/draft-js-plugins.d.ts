declare module 'draft-js-plugins-editor' {
  export type PluginsEditorProps =
    | Draft.EditorProps
    | {
        plugins: any;
      };

  export default class PluginsEditor extends React.Component<
    PluginsEditorProps,
    Draft.EditorState
  > {}
  export function createEditorStateWithText(text: string): PluginsEditor;
  export function composeDecorators(...func: any[]): (...args: any[]) => any;
}
