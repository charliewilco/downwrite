import { DWEditor } from '../components'
import { EditorState, convertFromRaw } from 'draft-js'
import { posts } from './db.json'

const content = convertFromRaw(posts[0].content)
const emptyContent = EditorState.createEmpty()
const preloadedContent = EditorState.createWithContent(content)
const mockEditor = state => mount(<DWEditor onChange={jest.fn()} editorState={state} />)

class WrappedEditor extends React.Component {
	state = {
		editorState: emptyContent
	}

	onChange = editorState => this.setState({ editorState })

	render() {
		return <DWEditor {...this.state} onChange={this.onChange} />
	}
}

describe('<DWEditor />', () => {
	it('Editor mounts', () => {
		const editor = mockEditor(emptyContent)
		expect(editor.exists()).toBe(true)
	})

	it('Editor mounts with preloaded content', () => {
		const editor = mockEditor(preloadedContent)
		expect(editor.exists()).toBe(true)
	})

	it('Editor takes content', () => {
		const editor = mount(<WrappedEditor />)
		editor.simulate('keyDown', { which: 'a' })
		expect(editor.state).toBeTruthy()
	})
})
