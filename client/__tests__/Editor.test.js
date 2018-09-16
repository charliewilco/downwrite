import { render, Simulate, wait } from 'react-testing-library';
import 'dom-testing-library/extend-expect';

import DWEditor from '../components/editor';
import { EditorState, convertFromRaw } from 'draft-js';
import { posts } from './db.json';

const content = convertFromRaw(posts[0].content);
const emptyContent = EditorState.createEmpty();
const preloadedContent = EditorState.createWithContent(content);
const mockEditor = state =>
  render(<DWEditor onChange={jest.fn()} editorState={state} />);

class WrappedEditor extends React.Component {
  state = {
    editorState: emptyContent
  };

  onChange = editorState => this.setState({ editorState });

  render() {
    return <DWEditor {...this.state} onChange={this.onChange} />;
  }
}

describe('<DWEditor />', () => {
  it('Editor mounts', () => {
    const { container } = mockEditor(emptyContent);
    expect(container).toBeTruthy();
  });

  it('Editor mounts with preloaded content', () => {
    const { container } = mockEditor(preloadedContent);
    expect(container).toBeTruthy();
  });

  it('Editor takes content', () => {
    const { container } = render(<WrappedEditor />);
    Simulate.keyDown(container);
    // expect(editor.state).toBeTruthy()
  });
});
