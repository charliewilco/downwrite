// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { PostList, Loading, EmptyPosts } from './components'
import { withCookies, Cookies } from 'react-cookie'

type Post = {
	title: String,
	id: String
}

type MainState = {
	posts: Array<Post>,
	loaded: boolean,
	layout: 'grid' | 'list'
}

class Main extends Component<{ cookies: typeof Cookies }, MainState> {
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
		const user = this.props.cookies.get('id')
		const token = this.props.cookies.get('token')

		h.set('Authorization', `Bearer ${token}`)

		const config = {
			method: 'GET',
			headers: h,
			mode: 'cors',
			cache: 'default'
		}

		const response = await fetch('http://localhost:4411/posts', config)
		const posts = await response.json()

		return this.setState({ posts, loaded: true })
	}

	// getPosts = () => {
	// 	return fetch('http://localhost:4411/posts')
	// 		.then(res => res.json())
	// 		.then(posts => this.setState({ posts, loaded: true }))
	// }

	componentWillMount() {
		this.getPosts()
	}

	onDelete = async (post: Object) => {
		const h = new Headers()
		const user = this.props.cookies.get('id')
		const token = this.props.cookies.get('token')

		h.set('Authorization', `Bearer ${token}`)

		const config = {
			method: 'DELETE',
			headers: h,
			mode: 'cors',
			cache: 'default'
		}

		const response = await fetch(`http://localhost:4411/posts/${post.id}`, config)
		const deletePost = await response.json()

		if (deletePost) {
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

export default withCookies(Main)
