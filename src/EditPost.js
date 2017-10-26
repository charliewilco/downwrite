// @flow

import React from 'react'
import { css } from 'glamor'
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js'
import { Block } from 'glamor/jsxstyle'
import { Button, Input, Loading, Wrapper, Helpers } from './components'
import format from 'date-fns/format'
import { DWEditor } from './components'
import { saveAs } from 'file-saver'
import { withCookies, Cookies } from 'react-cookie'

const editorShell = css({
	flex: 1,
	marginTop: '-1px',
	flexDirection: 'column',
	justifyContent: 'center',
	minHeight: '100%',
	width: `100%`,
	position: 'absolute',
	left: 0,
	right: 0
})

const editorContent = css({
	position: 'relative',
	paddingTop: 64
})

const meta = css({
	opacity: 0.5,
	fontSize: 'small'
})

const editorInner = css({
	backgroundColor: 'white',
	borderWidth: 1,
	borderStyle: 'solid',
	borderColor: 'rgba(0, 0, 0, .125)',
	fontWeight: '400'
})

type EditorSt = {
	title: string,
	post: Object,
	loaded: boolean,
	updated: boolean,
	editorState: EditorState,
	dateModified: Date
}

class EditPost extends React.Component<{ match: Object, cookies: typeof Cookies }, EditorSt> {
	static displayName = 'UpdatePostEditor'

	titleInput: HTMLInputElement

	state = {
		editorState: EditorState.createEmpty(),
		post: {},
		title: '',
		updated: false,
		loaded: false,
		unchanged: false,
		document: null,
		dateModified: new Date()
	}

	prepareContent = (content: Object) => convertFromRaw(content)

	updateCurrent = (body: Object) => {
		fetch(`http://localhost:4411/posts/${this.props.match.params.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body
		}).then(() => this.setState({ post: body, updated: true }))
	}

	updatePostContent = () => {
		// TODO: Use Token to update author or USER
		let { post, title, dateModified, editorState } = this.state
		const ContentState = editorState.getCurrentContent()
		const content = convertToRaw(ContentState)

		const newPost = {
			...post,
			title,
			content,
			dateModified
		}

		return this.updatePost(newPost)
	}

	getPost = async () => {
		const h = new Headers()
		const id = this.props.match.params.id
		const user = this.props.cookies.get('id')
		const token = this.props.cookies.get('token')

		h.set('Authorization', `Bearer ${token}`)

		const config = {
			method: 'GET',
			headers: h,
			mode: 'cors',
			cache: 'default'
		}

		const req = await fetch(`http://localhost:4411/posts/${id}`, config)
		const post = await req.json()

		return post
		// .then(() => )

		// this.setState({
		// 	post: {
		// 		...this.state.post,
		// 		content: convertFromRaw(this.state.post.content),
		// 	},
		// 	title: this.state.post.title,
		// 	editorState: EditorState.createWithContent(this.state.post.content),
		// 	loaded: true
		// })
	}

	componentWillMount() {
		this.getPost().then((post: { title: string }) => {
			return this.setState(
				{
					post,
					title: post.title,
					loaded: true
				},
				console.log(post)
			)
		})
	}

	// this.setState(prev => {
	// 	return {
	// 		post: { ...prev.post, content },
	// 		title: prev.post.title,
	// 		editorState: EditorState.createWithContent(content),
	// 		loaded: true
	// 	}
	// })

	componentDidMount() {}

	exportMD = async (body: Object) => {
		const res = await fetch('http://localhost:8793/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})

		const blob = await res.blob()

		saveAs(blob, `${body.title.replace(/\s+/g, '-').toLowerCase()}.md`)
	}

	export = () => {
		let { post, title, dateModified } = this.state
		const ContentState = this.state.editorState.getCurrentContent()
		const content = convertToRaw(ContentState)

		const newPost = {
			...post,
			title,
			content,
			dateModified
		}

		return this.exportMD(newPost)
	}

	onChange = (editorState: Object) => this.setState({ editorState })

	updateTitle = ({ target }: { target: EventTarget }) => {
		return this.setState(prevState => {
			let title = this.titleInput.value
			// target instanceof HTMLInputElement &&
			return {
				title: title
			}
		})
	}

	updatePost = (body: Object) => {
		return fetch(`/posts/${this.props.match.params.id}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})
	}

	render() {
		const { title, post, loaded, editorState } = this.state

		return !loaded ? (
			<Loading />
		) : (
			<Wrapper paddingTop={16}>
				<Block className={css(meta)} marginBottom={8}>
					{post.id} | {post.author} | Date Added:{' '}
					{format(post.dateAdded, 'HH:MM A, DD MMMM YYYY')}
				</Block>
				<Input
					inputRef={input => {
						this.titleInput = input
					}}
					value={title}
					onChange={e => this.updateTitle(e)}
				/>
				<Helpers exportToMarkdown={() => this.export()}>
					<div style={{ marginBottom: 16 }}>
						<h6 style={{ fontSize: 16, marginBottom: 8 }}>Tags</h6>
					</div>
				</Helpers>
				<Wrapper>
					<div>
						<DWEditor
							editorState={editorState}
							onChange={editorState => this.onChange(editorState)}>
							<Button onClick={() => this.updatePostContent()}>Save</Button>
						</DWEditor>
					</div>
				</Wrapper>
			</Wrapper>
		)
	}
}

export default withCookies(EditPost)
