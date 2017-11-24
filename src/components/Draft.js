import { RichUtils } from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import React from 'react'
import { css } from 'glamor'
import Toolbar from './Toolbar'
import './Editor.css'
import createMarkdownPlugin from 'draft-js-markdown-plugin'

const editorStyle = css({
	padding: 16,
	height: '100%',
	width: '100%'
})

const editorShell = css({
	// border: `1px solid rgba(0, 0, 0 ,.125)`,
	borderTop: 0,
	position: 'relative',
	paddingTop: 24
	// paddingTop: 52
})

export default class extends React.Component {
	static displayName = 'DWEditor'

	state = {
		editorState: this.props.editorState,
		plugins: [createMarkdownPlugin()]
	}

	focus = () => this.refs.editor.focus()

	handleKeyCommand = (command, editorState) => {
		const newState = RichUtils.handleKeyCommand(editorState, command)
		if (newState) {
			this.onChange(newState)
			return true
		}
		return false
	}

	onChange = editorState => this.props.onChange(editorState)

	onTab = e => {
		const maxDepth = 4
		this.onChange(RichUtils.onTab(e, this.props.editorState, maxDepth))
	}

	_toggleBlockType = blockType => {
		this.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType))
	}

	_toggleInlineStyle = inlineStyle => {
		this.onChange(RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle))
	}

	render() {
		const { editorState, children } = this.props
		// If the user changes block type before entering any text, we can
		// either style the placeholder or hide it. Let's just hide it now.
		let className = 'RichEditor-editor'
		var contentState = editorState.getCurrentContent()
		if (!contentState.hasText()) {
			if (
				contentState
					.getBlockMap()
					.first()
					.getType() !== 'unstyled'
			) {
				className += ' RichEditor-hidePlaceholder'
			}
		}

		return (
			<div className={`${css(editorShell)} OuterEditor`} css={{ height: '100%' }}>
				{this.props.toolbar && (
					<Toolbar
						editorState={editorState}
						onToggleInlineStyle={this._toggleInlineStyle}
						onToggleBlockType={this._toggleBlockType}
						children={children}
					/>
				)}

				<div className={`${css(editorStyle)} ${className}`} onClick={this.focus}>
					<Editor
						blockStyleFn={getBlockStyle}
						customStyleMap={styleMap}
						editorState={editorState}
						handleKeyCommand={this.handleKeyCommand}
						onChange={editorState => this.onChange(editorState)}
						onTab={this.onTab}
						placeholder="History will be kind to me for I intend to write it. — Winston Churchill"
						ref="editor"
						spellCheck={true}
						plugins={this.state.plugins}
					/>
				</div>
			</div>
		)
	}
}

// Custom overrides for "code" style.
const styleMap = {
	CODE: {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		fontFamily: 'Input Mono, "Menlo", "Consolas", monospace',
		fontSize: 14,
		padding: 2
	}
}

function getBlockStyle(block) {
	switch (block.getType()) {
		case 'blockquote':
			return 'RichEditor-blockquote'
		default:
			return null
	}
}

// class StyleButton extends React.Component {
//   constructor () {
//     super()
//     this.onToggle = e => {
//       e.preventDefault()
//       this.props.onToggle(this.props.style)
//     }
//   }
//   render () {
//     let className = 'RichEditor-styleButton'
//     if (this.props.active) {
//       className += ' RichEditor-activeButton'
//     }
//     return (
//       <span style={{ flex: 1, fontWeight: 300 }} className={className} onMouseDown={this.onToggle}>
//         {this.props.label}
//       </span>
//     )
//   }
// }
