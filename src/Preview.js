import React from 'react'
import { matchPath } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import { PREVIEW_ENDPOINT } from './utils/urls'
import { Content } from './components'

const ErrorSt = ({ error, message }) => (
	<Block maxWidth={528} margin="auto" padding={8}>
		<p className="f6">{error}. Ummm... something went horribly wrong.</p>
		<i>{message}</i>
	</Block>
)

export default class extends React.Component {
	state = {
		loading: true,
		error: false,
		post: {}
	}

	static displayName = 'Preview'

	getPreview = async id => {
		const req = await fetch(`${PREVIEW_ENDPOINT}/${id}`, {
			mode: 'cors',
			cache: 'default'
		})

		console.log(PREVIEW_ENDPOINT, id)
		const post = await req.json()

		return post
	}

	async componentWillMount() {
		const req = await this.getPreview(this.props.match.params.id)

		this.setState({ error: req.error, loading: false, post: req })
	}

	// TODO: Refactor this to do something smarter to render this component
	// See this is where recompose might be cool
	// I'm gonna need to take that back at some point
	// Will Next.js fix this?

	componentWillReceiveProps({ location }) {
		if (location !== this.props.location) {
			const newMatch = matchPath(location.pathname, { path: '/:id/preview' })
			this.getPreview(newMatch.params.id).then(post =>
				this.setState({ error: post.error, post })
			)
		}
	}

	render() {
		const { post, error, loading } = this.state
		return !loading && (error ? <ErrorSt {...post} /> : <Content {...post} />)
	}
}
