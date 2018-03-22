// @flow

import * as React from 'react'
import { saveAs } from 'file-saver'
import { Flex, Block } from 'glamor/jsxstyle'
import { convertToRaw, EditorState } from 'draft-js'
import { draftToMarkdown } from 'markdown-draft-js'

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
            console.log(entity)
            return '['
          },

          close: entity => {
            console.log(entity)
            return `](${entity.data.url || entity.data.href})`
          }
        }
      }
    })

  toMarkdown = async ({ title, content, date }: ExportCb) => {
    let markdown = `
---
title: ${title}
dateAdded: ${date.toString()}
---

${this.customDraft(content)}
`

    const contents = new Blob([markdown.trim()], { type: 'text/markdown; charset=UTF-8' })

    console.log(markdown)

    saveAs(contents, `${title.replace(/\s+/g, '-').toLowerCase()}.md`)
  }

  render() {
    return (
      <Block width="100%" maxWidth={512} marginBottom={16}>
        <h3 className="small" style={{ marginBottom: 16 }}>
          Export
        </h3>
        <Flex>
          <Block flex={1}>
            <Flex className="Export__list">
              <Markdown onClick={() => this.export(this.toMarkdown)} />
            </Flex>
          </Block>
        </Flex>
      </Block>
    )
  }
}
