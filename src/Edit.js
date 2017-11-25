// @flow

import * as React from 'react'
import { css } from 'glamor'
import { EditorState, convertToRaw } from 'draft-js'
import type { ContentState } from 'draft-js'
import Media from 'react-media'
import { matchPath } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import {
	Button,
	Input,
	Loading,
	Wrapper,
	Helpers,
	Modal,
	Toggle,
	Aux,
	DWEditor,
	SettingsIcon,
	Export,
	withUIFlash
} from './components'

import format from 'date-fns/format'
import isEmpty from 'lodash/isEmpty'
import { superConverter } from './utils/responseHandler'
import { POST_ENDPOINT } from './utils/urls'

const meta = css({
	opacity: 0.5,
	fontSize: 'small'
})

type EditorSt = {
	title: string,
	post: Object,
	loaded: boolean,
	updated: boolean,
	editorState: EditorState,
	dateModified: Date
}

type EditorPr = {
	token: string,
	user: string,
	match: {
		params: {
			id: string
		}
	},
	location: Location
}

class Edit extends React.Component<EditorPr, EditorSt> {
	static displayName = 'Edit'

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

	prepareContent: Function = (content: ContentState) => superConverter(content)

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
		const cx: ContentState = editorState.getCurrentContent()
		const content = convertToRaw(cx)
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

	getPost = async (id) => {
		const h = new Headers()
		const { token } = this.props

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
		const post = await this.getPost(this.props.match.params.id)
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

	onChange = (editorState: EditorState) => this.setState({ editorState })

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
		const { token, match } = this.props
		return fetch(`${POST_ENDPOINT}/${match.params.id}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(body)
		})
	}

	// TODO: Refactor this to do something smarter to render this component
	// See this is where recompose might be cool
	// I'm gonna need to take that back at some point
	// Will Next.js fix this?
	componentWillReceiveProps({ location }) {
		if (location !== this.props.location) {
			const newMatch = matchPath(location.pathname, { path: '/:id/edit' })
			console.log(location, newMatch)
			this.getPost(newMatch.params.id).then(post => this.setState({
				post: {
					...post,
					content: superConverter(post.content)
				},
				editorState: EditorState.createWithContent(superConverter(post.content)),
				title: post.title,
				loaded: true
			}))
		}
	}

	render() {
		const { title, post, loaded, editorState } = this.state

		return !loaded ? (
			<Loading />
		) : (
			<Media query={{ minWidth: 500 }}>
				{m => (
					<Toggle>
						{(open: boolean, toggleUIModal: Function) => (
							<Aux>
								{open && (
									<Modal closeUIModal={toggleUIModal}>
										<Export editorState={editorState} title={title} date={post.dateAdded} />
									</Modal>
								)}
								<Wrapper sm>
									<Helpers>
											<Button onClick={() => this.updatePostContent()}>Save</Button>
											<SettingsIcon onClick={toggleUIModal} />
									</Helpers>
									<Wrapper sm paddingTop={0} paddingLeft={4} paddingRight={4}>
										<Block className={css(meta)} marginBottom={8}>
											Added on <time dateTime={post.dateAdded}>{format(post.dateAdded, 'DD MMMM YYYY')}</time>
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
													onChange={(editorState: EditorState) => this.onChange(editorState)}
												/>
											)}
										</div>
									</Wrapper>
								</Wrapper>
							</Aux>
						)}
					</Toggle>
				)}
			</Media>
		)
	}
}

export default withUIFlash(Edit)
