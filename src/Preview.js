import React from 'react'
import { matchPath } from 'react-router-dom'
import Markdown from 'react-markdown'
import PrismCode from 'react-prism'
import 'prismjs'
import { Wrapper } from './components'
import './components/ganymede.css'
import { PREVIEW_ENDPOINT } from './utils/urls'
import format from 'date-fns/format'

const CodeBlock = ({ language, value, ...props }) => (
	<PrismCode className={`language-${language || 'javascript'}`} children={value} />
)

CodeBlock.defaultProps = {
	language: 'javascript'
}

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
			!loading && (
				<Wrapper sm fontFamily="Charter" textAlign="center">
					<h1 className="u-center f4">{post.title}</h1>
					<time dateTime={post.dateAdded}>{format(post.dateAdded, 'DD MMMM YYYY')}</time>
					<Wrapper textAlign="left" className="Preview">
						<Markdown source={post.content} renderers={{ code: CodeBlock }} />
					</Wrapper>
				</Wrapper>
			)
		)
	}
}
