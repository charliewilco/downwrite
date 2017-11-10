// @flow

import React from 'react'
import { css } from 'glamor'
import { EditorState, convertToRaw } from 'draft-js'
import { Block } from 'glamor/jsxstyle'
import {
	Button,
	Input,
	Loading,
	Wrapper,
	Helpers,
	Modal,
	Aux,
	SettingsIcon
} from './components'
import format from 'date-fns/format'
import { DWEditor } from './components'
import isEmpty from 'lodash.isempty'
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
	modalUIOpen: boolean,
	post: Object,
	loaded: boolean,
	updated: boolean,
	editorState: EditorState,
	dateModified: Date
}

type EditorPr = { token: string, user: string, match: Object }

export default class extends React.Component<EditorPr, EditorSt> {
	static displayName = 'Edit'

	titleInput: HTMLInputElement

	state = {
		modalUIOpen: true,
		editorState: EditorState.createEmpty(),
		post: {},
		title: '',
		updated: false,
		loaded: false,
		unchanged: false,
		document: null,
		dateModified: new Date()
	}

	toggleUIModal = () => this.setState(({ modalUIOpen }) => ({ modalUIOpen: !modalUIOpen }))

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
		const { user } = this.props
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
		const { id } = this.props.match.params
		const { user, token } = this.props

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

	shouldComponentUpdate(nextProps: Object, nextState: { post: Object }) {
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
		const { token } = this.props
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
		const { title, post, loaded, editorState, modalUIOpen } = this.state

		return !loaded ? (
			<Loading />
		) : (
			<Aux>
				{modalUIOpen && (
					<Modal closeUIModal={this.toggleUIModal}>i am a modal, deal with it</Modal>
				)}
				<Wrapper sm>
					<Helpers>
						<Button onClick={() => this.updatePostContent()}>Save</Button>
						<SettingsIcon onClick={this.toggleUIModal} />
					</Helpers>
					<Wrapper sm paddingTop={128}>
						<Block className={css(meta)} marginBottom={8}>
							{post.id} | {post.author} | Date Added:{' '}
							{format(post.dateAdded, 'HH:MM A, DD MMMM YYYY')}
						</Block>
						<Input
							inputRef={input => (this.titleInput = input)}
							value={title}
							onChange={e => this.updateTitle(e)}
						/>
						<div>
							{editorState !== null && (
								<DWEditor
									editorState={editorState}
									onChange={editorState => this.onChange(editorState)}
								/>
							)}
						</div>
					</Wrapper>
				</Wrapper>
			</Aux>
		)
	}
}
