// @flow
import * as React from 'react'
import { EditorState, convertToRaw } from 'draft-js'
import { DWEditor } from './components'
import { Redirect } from 'react-router-dom'
import { withCookies, Cookies } from 'react-cookie'
import { Wrapper, Input, Button } from './components'
import { css } from 'glamor'
import { createElement } from 'glamor/react'
import uuid from 'uuid/v4'

/* @jsx createElement */

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

class NewPost extends React.Component<{ cookies: typeof Cookies }, NewPostSt> {
	static displayName = 'NewPostEditor'

	state = {
		editorState: EditorState.createEmpty(),
		title: '',
		id: uuid(),
		dateAdded: new Date(),
		saved: false
	}

	addNew = async body => {
		const token = this.props.cookies.get('token')
		const response = await fetch('http://localhost:4411/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body
		})

		const newPost = await response.json()

		if (!newPost.error) {
			this.setState({ saved: false })
		}
	}

	addNewPost = () => {
		let { id, title, editorState, dateAdded } = this.state
		const ContentState = this.state.editorState.getCurrentContent()
		const content = convertToRaw(ContentState)
		const user = this.props.cookies.get('id')

		const post = JSON.stringify({
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
			<Wrapper paddingTop={20}>
				<Input value={title} onChange={e => this.setState({ title: e.target.value })} />
				<Wrapper>
					<DWEditor
						editorState={editorState}
						onChange={editorState => this.setState({ editorState })}>
						<Button onClick={this.addNewPost}>Add</Button>
					</DWEditor>
				</Wrapper>
			</Wrapper>
		)
	}
}

export default withCookies(NewPost)
