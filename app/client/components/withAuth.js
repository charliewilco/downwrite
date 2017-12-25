import React, { Component } from 'react'
import Cookies from 'universal-cookie'
import { POST_ENDPOINT } from '../utils/urls'
import 'isomorphic-fetch'

export default Cx => {
	return class extends Component {
		static displayName = `withAuth(${Cx.displayName || Cx.name})`

		static async getInitialProps(ctx) {
			const { req } = ctx
			console.log(req)
			const token = req.universalCookies.cookies.DW_TOKEN
			const config = {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}` },
				mode: 'cors'
			}
			const res = await fetch(POST_ENDPOINT, config)

			const posts = await res.json()
			return {
				token,
				posts
			}
		}

		render() {
			return <Cx {...this.props} />
		}
	}
}
