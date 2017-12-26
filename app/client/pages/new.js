// @flow
import * as React from 'react'
import { EditorState, convertToRaw } from 'draft-js'
import Cookies from 'universal-cookie'
import Router from 'next/router'
import Media from 'react-media'
import { Layout, DWEditor, Wrapper, Input, Button, Upload, Helpers } from '../components'

import uuid from 'uuid/v4'
import { POST_ENDPOINT } from '../utils/urls'

type NewPostSt = {
	saved: boolean,
	editorState: EditorState,
	id: string,
	title: string,
	dateAdded: Date
}

type NewPostProps = { token: string, user: string }

// TODO: Shouldn't be able to add if editor is empty

export default class extends React.Component<NewPostProps, NewPostSt> {
	static getInitialProps({ req, query }) {
		const ck = new Cookies()
		const token = req
			? req.universalCookies.cookies.DW_TOKEN
			: query.token || ck.get('DW_TOKEN')

		return {
			token
		}
	}

	state = {
		editorState: EditorState.createEmpty(),
		title: '',
		id: uuid(),
		dateAdded: new Date()
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
			body: JSON.stringify(body)
		})

		const newPost = await response.json()

		if (!newPost.error) {
			Router.push(`/${this.state.id}/edit`)
		}
	}

	addNewPost = () => {
		let { id, title, editorState, dateAdded } = this.state
		const ContentState = editorState.getCurrentContent()
		const content = JSON.stringify(convertToRaw(ContentState))
		const { user } = this.props

		const post: Object = {
			title: title.length > 0 ? title : `Untitled ${id}`,
			id,
			content,
			dateAdded,
			public: false,
			user
		}

		return this.addNew(post)
	}

	upload = (content: { title: string, editorState: EditorState }) => this.setState(content)

	render() {
		const { editorState, title, id } = this.state
		return (
			<Layout title="New Entry | Downwrite" token={this.props.token}>
				<Media query={{ minWidth: 500 }}>
					{m => (
						<Wrapper paddingTop={128} sm>
							<Helpers>
								<Button onClick={this.addNewPost}>Add</Button>
							</Helpers>
							<Wrapper sm paddingLeft={4} paddingRight={4}>
								<Upload upload={this.upload}>
									<Input
										placeholder="Untitled Document"
										value={title}
										onChange={e => this.setState({ title: e.target.value })}
									/>
									<DWEditor
										editorState={editorState}
										onChange={editorState => this.setState({ editorState })}
									/>
								</Upload>
							</Wrapper>
						</Wrapper>
					)}
				</Media>
			</Layout>
		)
	}
}
