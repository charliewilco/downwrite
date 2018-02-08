// @flow
import { convertFromRaw } from 'draft-js'
import type { ContentState } from 'draft-js'

export const superConverter: Function = (content: ContentState) => {
  return content.hasOwnProperty('entityMap')
    ? convertFromRaw(content)
    : convertFromRaw({ blocks: content.blocks, entityMap: {} })
}
