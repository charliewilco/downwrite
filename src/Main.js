// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { PostList, Loading, EmptyPosts } from './components'
import { POST_ENDPOINT } from './utils/urls'

type Post = {
	title: string,
	id: string
}

type MainState = {
	posts: Array<Post>,
	loaded: boolean,
	layout: 'grid' | 'list'
}

export default class Main extends Component<{ user: string, token: string }, MainState> {
	static displayName = 'Main View'

	state = {
		posts: [],
		loaded: false,
		layout: 'grid'
	}

	layoutChange = (x: 'grid' | 'list') => {
		return this.setState({ layout: x })
	}

	getPosts = async () => {
		const h = new Headers()

		h.set('Authorization', `Bearer ${this.props.token}`)

		const config = {
			method: 'GET',
			headers: h,
			mode: 'cors',
			cache: 'default'
		}

		const response = await fetch(POST_ENDPOINT, config)
		const posts = await response.json()

		return this.setState({ posts, loaded: true })
	}

	componentWillMount() {
		this.getPosts()
	}

	onDelete = async (post: Object) => {
		const { user, token } = this.props

		const config = {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			},
			mode: 'cors',
			cache: 'default'
		}

		const response = await fetch(`${POST_ENDPOINT}/${post.id}`, config)

		if (response.ok) {
			return await this.getPosts()
		}
	}

	render() {
		const { loaded, posts, layout } = this.state
		return (
			<Block padding={16} height="100%">
				{loaded ? (
					posts.length > 0 ? (
						<PostList
							layout={layout}
							onDelete={this.onDelete}
							layoutChange={this.layoutChange}
							posts={posts}
						/>
					) : (
						<EmptyPosts />
					)
				) : (
					<Loading size={100} />
				)}
			</Block>
		)
	}
}
