// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { PostList, Loading, EmptyPosts } from './components'

type Post = {
	title: String,
	id: String
}

type State = {
	posts: Array<Post>,
	loaded: boolean,
	layout: 'grid' | 'list'
}

export default class extends Component<void, State> {
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
		const response = await fetch('/posts')
		const posts = await response.json()

		return this.setState({ posts, loaded: true })
	}

	componentWillMount() {
		this.getPosts()
	}

	onDelete = async (post: Object) => {
		const response = await fetch(`/posts/${post.id}`, { method: 'DELETE' })
		const deletePost = await response.json()

		if (deletePost) {
			return this.getPosts()
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
