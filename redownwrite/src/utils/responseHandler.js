// @flow
import { convertFromRaw } from 'draft-js'
import type { ContentState } from 'draft-js'

export const superConverter: Function = (content: ContentState) => {
  return content.hasOwnProperty('entityMap')
    ? convertFromRaw(content)
    : convertFromRaw({ blocks: content.blocks, entityMap: {} })
}

export const createHeader: Function = (token: string, method: string) => {
  const h = new Headers()

  h.set('Authorization', `Bearer ${token}`)
  h.set('Content-Type', 'application/json')

  return {
    method,
    headers: h,
    mode: 'cors',
    cache: 'default'
  }
}
