// @flow

import React, { Component } from 'react'
import type { ContentState } from 'draft-js'

type WordCounterers = {
  limit: number,
  editorState: ContentState,
  component: React.Node
}

export default class WordCounter extends Component<WordCounterers, void> {
  static defaultProps = {
    component: 'span'
  }

  getWordCount(editorState: ContentState) {
    const plainText = editorState.getCurrentContent().getPlainText('')
    const regex = /(?:\r\n|\r|\n)/g // new line, carriage return, line feed
    const cleanString = plainText.replace(regex, ' ').trim() // replace above characters w/ space
    const wordArray = cleanString.match(/\S+/g) // matches words according to whitespace
    return wordArray ? wordArray.length : 0
  }

  // getClassNames(count, limit) {
  //   const { theme = {}, className } = this.props;
  //   const defaultStyle = unionClassNames(theme.counter, className);
  //   const overLimitStyle = unionClassNames(theme.counterOverLimit, className);
  //   return count > limit ? overLimitStyle : defaultStyle;
  //   const classNames = this.getClassNames(count, limit);
  // }

  render() {
    const { editorState, component: Component } = this.props
    const count = this.getWordCount(editorState)

    return (
      <Component>
        <small>
          <pre>Word Count: {count}</pre>
        </small>
      </Component>
    )
  }
}
