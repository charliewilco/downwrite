import React from 'react'
import { matchPath } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import getToken from '../utils/getToken'
import { PREVIEW_ENDPOINT } from '../utils/urls'
import { Content, Layout } from '../components'
import 'isomorphic-fetch'

// `:id/preview`

export default class extends React.Component {
	static displayName = 'Preview'

	static async getInitialProps({ req, query }) {
		const { token, userID, username } = getToken(req, query)

		let { id } = req.params

		const res = await fetch(`${PREVIEW_ENDPOINT}/${id}`, {
			mode: 'cors',
			cache: 'default'
		})
		const post = await res.json()

		return {
			id,
			post,
			token,
			userID,
			username
		}
	}

	render() {
		return (
			<Layout
				title={this.props.post.title}
				token={this.props.token}
				username={this.props.username}
				userID={this.props.userID}>
				<Content {...this.props.post} />
			</Layout>
		)
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
