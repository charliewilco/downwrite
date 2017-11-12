// @flow

import * as React from 'react'
import { saveAs } from 'file-saver'
import { MD_ENDPOINT, JSON_ENDPOINT, MEDIUM_ENDPOINT } from '../utils/urls'
import { Aux } from './'
import { convertToRaw, EditorState } from 'draft-js'
import type { ContentState } from 'draft-js'

import Markdown from './ExportIcons/MD'
import JSONBtn from './ExportIcons/JSONIcon'
import Medium from './ExportIcons/Medium'

type ExportPr = { title: string, date: typeof Date, editorState: EditorState }
type ExportCb = { title: string, content: ContentState, date: typeof Date }

export default class extends React.Component<ExportPr> {
	static displayName = 'Export'

	export = (cb: Function) => {
		let { title, date, editorState } = this.props
		const cx: ContentState = editorState.getCurrentContent()
		const content = convertToRaw(cx)

		return cb({
			title,
			content,
			date
		})
	}

	toJSON = async ({ title, content, date }: ExportCb) => {
		const res = await fetch(JSON_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title, content, date })
		})

		const jsonex = await res.blob()
		const titlex: string = title.replace(/\s+/g, '-').toLowerCase()

		saveAs(jsonex, `${titlex}.json`)
	}

	toMedium = async ({ title, content, date }: ExportCb) => {
		const res = await fetch(MEDIUM_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title, content, date })
		})

		const medium = await res.json()

		console.log(medium)
	}

	toMarkdown = async ({ title, content, date }: ExportCb) => {
		const res = await fetch(MD_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ title, content, date })
		})

		const markdown = await res.blob()

		saveAs(markdown, `${title.replace(/\s+/g, '-').toLowerCase()}.md`)
	}

	render() {
		return (
			<Aux>
				<Markdown onClick={() => this.export(this.toMarkdown)} />
				<JSONBtn onClick={() => this.export(this.toJSON)} />
				<Medium onClick={() => this.export(this.toMedium)} />
			</Aux>
		)
	}
}
