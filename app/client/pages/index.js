// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import orderBy from 'lodash/orderBy'
import { Layout, PostList, Loading, EmptyPosts } from '../components'
import getToken from '../utils/getToken'
import { POST_ENDPOINT } from '../utils/urls'
import 'isomorphic-fetch'

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

class Index extends Component<MainPr, MainState> {
	static displayName = 'Dashboard'

	static async getInitialProps({ req, query }) {
		const { token, userID, username } = getToken(req, query)

		const config = {
			headers: { Authorization: `Bearer ${token}` },
			mode: 'cors'
		}

		const res = await fetch(POST_ENDPOINT, config)
		const posts = await res.json()

		return {
			token,
			userID,
			username,
			posts
		}
	}

	state = {
		posts: this.props.posts,
		loaded: true,
		layout: 'grid'
	}

	layoutChange = (x: 'grid' | 'list') => {
		return this.setState({ layout: x })
	}

	getPosts = async () => {
		const { token } = this.props
		const config = {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			},
			mode: 'cors',
			cache: 'default'
		}

		const res = await fetch(POST_ENDPOINT, config)
		const posts = await res.json()

		return posts
	}

	// async componentWillMount() {
	// 	const posts = await this.getPosts()
	// 	this.setState({ posts })
	// }

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
		const { loaded, layout, posts } = this.state
		return (
			<Layout title="Dashboard | Downwrite" token={this.props.token}>
				<Block
					paddingLeft={8}
					paddingRight={8}
					paddingTop={16}
					paddingBottom={16}
					height="100%">
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
			</Layout>
		)
	}
}

export default Index
