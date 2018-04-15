// @flow
import { Component } from 'react'
import orderBy from 'lodash/orderBy'
import { POST_ENDPOINT } from '../utils/urls'

type FetchProps = {
  sortResponse: ?Function,
  token: string,
  endpoint: string,
  children: Function
}

type FetchState = {
  posts: Array<*>
}

export default class extends Component<FetchProps, FetchState> {
  state = {
    posts: []
  }

  static defaultProps = {
    sortResponse: (x: Array<*>) => x,
    endpoint: POST_ENDPOINT
  }

  createHeader = (method: string) => {
    const h = new Headers()
    const { token } = this.props

    h.set('Authorization', `Bearer ${token}`)
    h.set('Content-Type', 'application/json')

    return {
      method,
      headers: h,
      mode: 'cors',
      cache: 'default'
    }
  }

  getPosts = async () => {
    const config = this.createHeader('GET')
    const req = await fetch(this.props.endpoint, config)
    const posts = orderBy(await req.json(), ['dateAdded'], ['desc'])

    this.setState({ posts })
  }

  // TODO: Move this to React Suspense!!
  // TODO: Or move to componentDidMount and add loading State
  componentDidMount() {
    this.getPosts()
  }

  render() {
    return this.props.children(this.state.posts)
  }
}
