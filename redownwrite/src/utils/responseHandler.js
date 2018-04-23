// @flow
import { convertFromRaw } from 'draft-js'
import type { ContentState } from 'draft-js'

export const superConverter: Function = (content: ContentState) => {
  return content.hasOwnProperty('entityMap')
    ? convertFromRaw(content)
    : convertFromRaw({ blocks: content.blocks, entityMap: {} })
}

type HeaderMethod = 'GET' | 'PUT' | 'POST' | 'DELETE'

export const createHeader: Function = (method: HeaderMethod = 'GET', token: string) => {
  const h = new Headers()

  token && h.set('Authorization', `Bearer ${token}`)
  h.set('Content-Type', 'application/json')

  return {
    method,
    headers: h,
    mode: 'cors',
    cache: 'default'
  }
}
