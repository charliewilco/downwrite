import { Component } from 'react'
import { POST_ENDPOINT } from '../utils/urls'
import { TOKEN } from '../utils/cookie'

export default class extends Component {
	state = {
		posts: []
	}

	getPosts = async () => {
		const req = await fetch(POST_ENDPOINT, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${TOKEN}`
			},
			mode: 'cors',
			cache: 'default'
		})

		const posts = await req.json()

		this.setState({ posts })
	}

	componentWillMount() {
		this.getPosts()
	}

	render() {
		return this.props.children(this.state.posts)
	}
}
