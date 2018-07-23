// @flow
import { Component } from 'react'
import orderBy from 'lodash/orderBy'
import { POST_ENDPOINT } from '../utils/urls'
import { createHeader } from '../utils/responseHandler'
import 'universal-fetch'

type FetchProps = {
  sortResponse: ?Function,
  token: string,
  endpoint: string,
  children: Function
}

type FetchState = {
  posts: Array<*>
}

export default class CollectionFetch extends Component<FetchProps, FetchState> {
  state = {
    posts: []
  }

  static defaultProps = {
    sortResponse: (x: Array<*>) => x,
    endpoint: POST_ENDPOINT
  }

  getPosts = async () => {
    const { endpoint, token } = this.props
    const config = createHeader('GET', token)
    const posts = await fetch(endpoint, config).then(res => res.json())

    this.setState({ posts: orderBy(posts, ['dateAdded'], ['desc']) || [] })
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
