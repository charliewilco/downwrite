// @flow
// @jsx createElement
import * as React from 'react'
import { EditorState, convertToRaw } from 'draft-js'
import { DWEditor } from './components'
import { Redirect } from 'react-router-dom'
import { Wrapper, Input, Button, Helpers } from './components'
import { css } from 'glamor'
import { createElement } from 'glamor/react'
import uuid from 'uuid/v4'
import { POST_ENDPOINT } from './utils/urls'

const editorShell = css({
	flex: 1,
	marginTop: '-1px',
	flexDirection: 'column',
	justifyContent: 'center',
	padding: 16,
	minHeight: '100%',
	width: `100%`,
	position: 'absolute',
	left: 0,
	right: 0
})

const editorInner = css({
	backgroundColor: 'white',
	borderWidth: 1,
	borderStyle: 'solid',
	borderColor: 'rgba(0, 0, 0, .125)',
	fontWeight: '400'
})

type NewPostSt = {
	saved: boolean,
	editorState: EditorState,
	id: string,
	title: string,
	dateAdded: Date
}

type NewPostProps = { token: String, user: String }

// TODO: Shouldn't be able to add if editor is empty
// TODO: If title is empty post should be named `Untitled Document ${uuid()}`

export default class extends React.Component<NewPostProps, NewPostSt> {
	state = {
		editorState: EditorState.createEmpty(),
		title: '',
		id: uuid(),
		dateAdded: new Date(),
		saved: false
	}

	static displayName = 'NewPostEditor'

	addNew = async (body: Object) => {
		const { token } = this.props
		const response = await fetch(POST_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body
		})

		const newPost = await response.json()

		if (!newPost.error) {
			this.setState({ saved: true })
		}
	}

	addNewPost = () => {
		let { id, title, editorState, dateAdded } = this.state
		const ContentState = this.state.editorState.getCurrentContent()
		const content = JSON.stringify(convertToRaw(ContentState))
		const { user } = this.props

		const post: String = JSON.stringify({
			title,
			id,
			content,
			dateAdded,
			user
		})

		return this.addNew(post)
	}

	render() {
		const { editorState, title, saved, id } = this.state
		return saved ? (
			<Redirect to={`/${id}/edit`} />
		) : (
			<Wrapper paddingTop={128} sm>
				<Helpers>
					<Button onClick={this.addNewPost}>Add</Button>
				</Helpers>
				<Wrapper>
					<Input
						placeholder="Untitled Document"
						value={title}
						onChange={e => this.setState({ title: e.target.value })}
					/>
					<DWEditor
						editorState={editorState}
						onChange={editorState => this.setState({ editorState })}
					/>
				</Wrapper>
			</Wrapper>
		)
	}
}
