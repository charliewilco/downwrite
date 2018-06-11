// @flow

import * as React from 'react'
import { convertToRaw, EditorState } from 'draft-js'
import { draftToMarkdown } from 'markdown-draft-js'
import styled from 'styled-components'
import FileSaver from 'file-saver'
import Markdown from './export-markdown-icon'
import { createMarkdown } from '../utils/markdownTemplate'

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

const FILE_TYPE = { type: 'text/markdown; charset=UTF-8' }

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
    try {
      let isFileSaverSupported: boolean = !!new Blob()
      // TODO: Replicate FileSaver API
      if (isFileSaverSupported) {
        let md = createMarkdown(title, this.customDraft(content), date)
        let blob = new Blob([md.trim()], FILE_TYPE)
        FileSaver.saveAs(blob, `${title.replace(/\s+/g, '-').toLowerCase()}.md`)
      }
    } catch (err) {
      console.log(err)
    }
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
