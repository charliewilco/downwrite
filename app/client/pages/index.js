// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import orderBy from 'lodash/orderBy'
import { PostList, Loading, EmptyPosts } from '../components'
import { POST_ENDPOINT } from '../utils/urls'
import { TOKEN } from '../utils/cookie'
import 'isomorphic-unfetch'

type Post = {
	title: string,
	id: string
}

type MainPr = {
	user: string,
	token: string,
	closeNav: Function
}

type MainState = {
	posts: Array<Post>,
	loaded: boolean,
	layout: 'grid' | 'list'
}

export default class extends Component<MainPr, MainState> {
	static displayName = 'Dashboard'

	static async getInitalProps() {
		const cookies = new Cookies()
		const posts = await this.getPosts()
		return {
			posts: orderBy(posts, ['dateAdded'], ['desc']),
			token: TOKEN
		}
	}

	state = {
		posts: this.props.posts || [],
		loaded: true,
		layout: 'grid'
	}

	layoutChange = (x: 'grid' | 'list') => {
		return this.setState({ layout: x })
	}

	getPosts = async () => {
		console.log('hello', TOKEN)
		const config = {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${TOKEN}`
			},
			mode: 'cors',
			cache: 'default'
		}

		const response = await fetch(POST_ENDPOINT, config)
		const posts = await response.json()

		return posts
	}

	async componentWillMount() {
		const posts = await this.getPosts()
		this.setState({ posts })
	}

	onDelete = async (post: Object) => {
		const { token } = this.props

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
			<Block paddingLeft={8} paddingRight={8} paddingTop={16} paddingBottom={16} height="100%">
				<button onClick={() => this.getPosts()}>Fetch</button>
				{posts.length > 0 ? (
					<PostList
						layout={layout}
						onDelete={this.onDelete}
						layoutChange={this.layoutChange}
						posts={posts}
					/>
				) : (
					<EmptyPosts />
				)}
			</Block>
		)
	}
}
