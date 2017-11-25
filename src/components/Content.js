import React from 'react'
import Markdown from 'react-markdown'
import PrismCode from 'react-prism'
import 'prismjs'
import { Wrapper } from './'
import './ganymede.css'
import format from 'date-fns/format'

const CodeBlock = ({ language, value, ...props }) => (
	<PrismCode className={`language-${language || 'javascript'}`} children={value} />
)

CodeBlock.defaultProps = {
	language: 'javascript'
}

export default ({ title, dateAdded, content }) => (
	<Wrapper sm fontFamily="Charter" textAlign="center">
		<h1 className="u-center f4">{title}</h1>
		<time dateTime={dateAdded}>{format(dateAdded, 'DD MMMM YYYY')}</time>
		<Wrapper textAlign="left" className="Preview">
			<Markdown source={content} renderers={{ code: CodeBlock }} />
		</Wrapper>
	</Wrapper>
)
