// @flow

import * as React from 'react'
import { saveAs } from 'file-saver'
import { convertToRaw, EditorState } from 'draft-js'
import { draftToMarkdown } from 'markdown-draft-js'
import styled from 'styled-components'
import Markdown from './ExportMarkdownIcon'

import type { ContentState } from 'draft-js'

type ExportPr = {
  title: string,
  date: Date,
  editorState: EditorState
}

type ExportCb = {
  title: string,
  content: ContentState,
  date: Date
}

const ExportContainer = styled.div`
  display: block;
  width: 100%;
  max-width: 512px;
  margin-bottom: 16px;
`

const ExportTitle = styled.h3`
  margin-bottom: 16px;
`

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

  customDraft = (content: ContentState) =>
    draftToMarkdown(content, {
      entityItems: {
        LINK: {
          open: entity => {
            return '['
          },

          close: entity => {
            return `](${entity.data.url || entity.data.href})`
          }
        }
      }
    })

  toMarkdown = ({ title, content, date }: ExportCb) => {
    let markdown = `
---
title: ${title}
dateAdded: ${date.toString()}
---

${this.customDraft(content)}
`
    const contents = new Blob([markdown.trim()], { type: 'text/markdown; charset=UTF-8' })

    saveAs(contents, `${title.replace(/\s+/g, '-').toLowerCase()}.md`)
  }

  onChange = () => this.export(this.toMarkdown)

  render() {
    return (
      <ExportContainer>
        <ExportTitle className="small">Export</ExportTitle>
        <Markdown onClick={this.onChange} />
      </ExportContainer>
    )
  }
}
