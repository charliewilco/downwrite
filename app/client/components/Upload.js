import React, { Component } from 'react'
import fm from 'front-matter'
import { convertFromRaw, EditorState } from 'draft-js'
import Dropzone from 'react-dropzone'
import { markdownToDraft } from 'markdown-draft-js'

export default class extends Component {
	static displayName = 'UploadDropzone'

	state = { files: [] }

	extractMarkdown = files => {
		let reader = new window.FileReader()

		reader.onload = e => {
			let md = fm(reader.result)

			const state = {
				title: md.attributes.title || '',
				editorState: EditorState.createWithContent(convertFromRaw(markdownToDraft(md.body)))
			}

			return this.props.upload(state)
		}
		reader.readAsText(files[0])
	}

	onDrop = files => this.extractMarkdown(files)

	render() {
		return (
			<Dropzone
				accept="text/markdown, text/x-markdown, text/plain"
				multiple={false}
				style={{ border: 0, width: '100%' }}
				onDrop={this.onDrop}
				disableClick
				disabled={this.props.disabled}>
				{this.props.children}
			</Dropzone>
		)
	}
}
