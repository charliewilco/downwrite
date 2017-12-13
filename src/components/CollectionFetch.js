import { Component } from 'react'
import orderBy from 'lodash/orderBy'
import { POST_ENDPOINT } from '../utils/urls'

export default class extends Component {
	state = {
		posts: []
	}

	getPosts = async () => {
		const req = await fetch(POST_ENDPOINT, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${this.props.token}`
			},
			mode: 'cors',
			cache: 'default'
		})

		const posts = orderBy(await req.json(), ['dateAdded'], ['desc'])

		this.setState({ posts })
	}

	componentWillMount() {
		this.getPosts()
	}

	render() {
		return this.props.children(this.state.posts)
	}
}
