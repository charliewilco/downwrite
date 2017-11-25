import React from 'react'
import { matchPath } from 'react-router-dom'
import { PREVIEW_ENDPOINT } from './utils/urls'
import { Content } from './components'

export default class extends React.Component {
	state = {
		loading: true,
		post: {}
	}

	static displayName = 'Preview'

	getPreview = async id => {
		const req = await fetch(`${PREVIEW_ENDPOINT}/${id}`, {
			mode: 'cors',
			cache: 'default'
		})
		const post = await req.json()

		return post
	}

	async componentWillMount() {
		const post = await this.getPreview(this.props.match.params.id)

		this.setState({ post, loading: false })
	}

	// TODO: Refactor this to do something smarter to render this component
	// See this is where recompose might be cool
	// I'm gonna need to take that back at some point
	// Will Next.js fix this?

	componentWillReceiveProps({ location }) {
		if (location !== this.props.location) {
			const newMatch = matchPath(location.pathname, { path: '/:id/preview' })
			this.getPreview(newMatch.params.id).then(post => this.setState({ post }))
		}
	}

	render() {
		const { post, loading } = this.state
		return (
			!loading && (<Content {...post} />)
		)
	}
}
