// @flow

import React from 'react'
import { css } from 'glamor'
import { EditorState, convertToRaw } from 'draft-js'
import { Block } from 'glamor/jsxstyle'
import { Button, Input, Loading, Wrapper, Helpers } from './components'
import format from 'date-fns/format'
import { DWEditor } from './components'
import isEmpty from 'lodash.isempty'
import { saveAs } from 'file-saver'
import { withCookies, Cookies } from 'react-cookie'
import { superConverter } from './utils/responseHandler'
import { POST_ENDPOINT, MD_ENDPOINT } from './utils/urls'

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

	prepareContent = (content: Object) => superConverter(content)

	updateCurrent = (body: Object) => {
		fetch(`${POST_ENDPOINT}/${this.props.match.params.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body
		}).then(() => this.setState({ post: body, updated: true }))
	}

	updatePostContent = () => {
		let { post, title, dateModified, editorState } = this.state
		const user = this.props.cookies.get('id')
		const ContentState: typeof ContentState = editorState.getCurrentContent()
		const content = convertToRaw(ContentState)
		const { _id, __v, ...sPost } = post

		const newPost = {
			...sPost,
			title,
			content,
			dateModified,
			user
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

		const req = await fetch(`${POST_ENDPOINT}/${id}`, config)
		const post: Object = await req.json()

		return post
	}

	shouldComponentUpdate(nextProps, nextState: { post: Object }) {
		return isEmpty(nextState.post) || isEmpty(nextState.post.content.blocks)
	}

	async componentWillMount() {
		const post = await this.getPost()
		const content = await superConverter(post.content)

		this.setState({
			post: {
				...post,
				content
			},
			editorState: EditorState.createWithContent(content),
			title: post.title,
			loaded: true
		})
	}

	componentDidMount() {
		/// const content = convertFromRaw()
		/// you get an object back from convertToRaw { blocks, entityMap }
		/// I wonder if the entityMap is disappearing because it's empty...
	}

	exportMD = async (body: Object) => {
		const res = await fetch(MD_ENDPOINT, {
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

	updateTitle = ({ target: EventTarget }: { target: EventTarget }) => {
		return this.setState(prevState => {
			let title = this.titleInput.value
			// target instanceof HTMLInputElement &&
			return {
				title: title
			}
		})
	}

	updatePost = (body: Object) => {
		const token: string = this.props.cookies.get('token')
		return fetch(`${POST_ENDPOINT}/${this.props.match.params.id}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(body)
		})
	}

	render() {
		const { title, post, loaded, editorState } = this.state

		return !loaded ? (
			<Loading />
		) : (
			<Wrapper paddingTop={16} sm>
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
				<Wrapper sm>
					<div>
						{editorState !== null && (
							<DWEditor
								editorState={editorState}
								onChange={editorState => this.onChange(editorState)}>
								<Button onClick={() => this.updatePostContent()}>Save</Button>
							</DWEditor>
						)}
					</div>
				</Wrapper>
			</Wrapper>
		)
	}
}

export default withCookies(EditPost)
