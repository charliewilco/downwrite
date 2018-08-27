import Cookies from 'universal-cookie'
import * as Draft from 'draft-js'
import { __IS_BROWSER__ } from './dev'

export const superConverter: Function = (content: Draft.RawDraftContentState) => {
  return content.hasOwnProperty('entityMap')
    ? Draft.convertFromRaw(content)
    : Draft.convertFromRaw({ blocks: content.blocks, entityMap: {} })
}

type HeaderMethod = 'GET' | 'PUT' | 'POST' | 'DELETE'

export const createHeader = (
  method: HeaderMethod = 'GET',
  token: string
) => {
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

export const getToken = (req, query) => {
  const ck = new Cookies()

  const token = req
    ? req.universalCookies.cookies.DW_TOKEN
    : query.token || ck.get('DW_TOKEN')

  return { token }
}
