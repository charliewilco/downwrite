// @flow

import React, { Component, type ComponentType } from 'react'
import type { ContentState } from 'draft-js'

type WordCounterers = {
  limit: number,
  editorState: ContentState,
  component: ComponentType<any>
}

export default class WordCounter extends Component<WordCounterers, void> {
  static defaultProps = {
    component: 'span'
  }

  getSelectionCount(editorState: ContentState): number {
    let selectionState = editorState.getSelection()
    let anchorKey = selectionState.getAnchorKey()
    let currentContent = editorState.getCurrentContent()
    let currentContentBlock = currentContent.getBlockForKey(anchorKey)
    let start = selectionState.getStartOffset()
    let end = selectionState.getEndOffset()
    let selectedText = currentContentBlock.getText().slice(start, end)

    return this.createWordCount(selectedText)
  }

  createWordCount(str: string): number {
    let regex = /(?:\r\n|\r|\n)/g // new line, carriage return, line feed
    let cleanString = str.replace(regex, ' ').trim() // replace above characters w/ space
    let wordArray = cleanString.match(/\S+/g) // matches words according to whitespace

    return wordArray ? wordArray.length : 0
  }

  getWordCount(editorState: ContentState): number {
    let plainText = editorState.getCurrentContent().getPlainText('')

    return this.createWordCount(plainText)
  }

  // NOTE: Use snapshoting in 16.3

  render() {
    let { editorState, component: Cx } = this.props

    let count = this.getWordCount(editorState)
    let selectionCount = this.getSelectionCount(editorState)

    let displayCount = selectionCount > 0 ? selectionCount : count

    return (
      <Cx>
        <small>
          <pre>Word Count: {displayCount}</pre>
        </small>
      </Cx>
    )
  }
}
