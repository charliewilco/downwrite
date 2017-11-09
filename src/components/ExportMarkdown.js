// @flow

import * as React from 'react'
import { css } from 'glamor'
import { saveAs } from 'file-saver'
import { MD_ENDPOINT } from '../utils/urls'
import { convertToRaw } from 'draft-js'

const mdButton = css({
	border: 0,
	display: 'block',
	'& > svg': {
		display: 'block'
	}
})

let color = 'rgba(37, 132, 164, .5)'

export default class extends React.Component<{ post: Object }, void> {
	static displayName = 'Markdown'

	exportToMarkdown = async (body: Object) => {
		const res = await fetch(MD_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})

		const blob = await res.blob()

		saveAs(blob, `${body.title.replace(/\s+/g, '-').toLowerCase()}.md`)
	}

	exportMD = () => {
		let { post, title, dateModified, editorState } = this.props.post
		const ContentState = editorState.getCurrentContent()
		const content = convertToRaw(ContentState)

		return this.exportToMarkdown({
			...post,
			title,
			content,
			dateModified
		})
	}

	render() {
		return (
			<button className={css(mdButton)} onClick={() => this.exportMD()}>
				<svg width="25" height="15.38461538" viewBox="0 0 208 128">
					<rect
						width="198"
						height="118"
						x="5"
						y="5"
						ry="10"
						stroke={color}
						strokeWidth="10"
						fill="none"
					/>
					<path
						fill={color}
						d="M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z"
					/>
				</svg>
			</button>
		)
	}
}
