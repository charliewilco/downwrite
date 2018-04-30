import React, { Component } from 'react'
import fm from 'front-matter'
import { convertFromRaw, EditorState } from 'draft-js'
import Dropzone from 'react-dropzone'
import { markdownToDraft } from 'markdown-draft-js'

export default class extends Component {
  state = { files: [] }

  reader = new FileReader()

  extractMarkdown = files => {
    this.reader.onload = e => {
      let md = fm(this.reader.result)

      return this.props.upload({
        title: md.attributes.title || '',
        editorState: EditorState.createWithContent(
          convertFromRaw(markdownToDraft(md.body, { preserveNewlines: true }))
        )
      })
    }

    this.reader.readAsText(files[0])
  }

  onDrop = files => this.extractMarkdown(files)

  render() {
    const { disabled, children } = this.props
    return (
      <Dropzone
        accept="text/markdown, text/x-markdown, text/plain"
        multiple={false}
        style={{ border: 0, width: '100%' }}
        onDrop={this.onDrop}
        disableClick
        disabled={disabled}
        children={children}
      />
    )
  }
}
