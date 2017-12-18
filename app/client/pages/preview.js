import React from 'react'
import { matchPath } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import { PREVIEW_ENDPOINT } from '../utils/urls'
import { Content } from '../components'
import 'isomorphic-fetch'

// `:id/preview`

export default class extends React.Component {
	static displayName = 'Preview'

	static async getInitialProps({ req, query }) {
		let { id } = req.params
		const { post } = query

		return {
			id,
			dateAdded: post.dateAdded,
			title: post.title,
			content: post.content,
			errorMessage: post.error
		}
	}

	render() {
		return <Content {...this.props} />
	}
}

// state = {
// 	loading: true,
// 	error: false,
// 	post: {}
// }

// getPreview = async id => {
// 	const req = await fetch(`${PREVIEW_ENDPOINT}/${id}`, {
// 		mode: 'cors',
// 		cache: 'default'
// 	})

// 	const post = await req.json()

// 	return post
// }

// async componentWillMount() {
// 	const post = await this.getPreview(this.props.id)
// 	// TODO: This could be more function-like
// 	this.setState({ error: post.error, loading: false, post })
// }

// TODO: Refactor this to do something smarter to render this component
// See this is where recompose might be cool
// I'm gonna need to take that back at some point
// Will Next.js fix this?

// componentWillReceiveProps({ location }) {
// 	if (location !== this.props.location) {
// 		const newMatch = matchPath(location.pathname, { path: '/:id/preview' })
// 		this.getPreview(newMatch.params.id).then(post =>
// 			this.setState({ error: post.error, post })
// 		)
// 	}
// }

const ErrorSt = ({ error, message }) => (
	<Block maxWidth={528} margin="auto" padding={8}>
		<p className="f6">{error}. Ummm... something went horribly wrong.</p>
		<i>{message}</i>
	</Block>
)
