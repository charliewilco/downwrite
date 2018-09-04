import * as React from 'react'
import orderBy from 'lodash/orderBy'
import { POST_ENDPOINT } from '../utils/urls'
import { createHeader } from '../utils/responseHandler'
import 'universal-fetch'

interface FetchState {
  posts: any[];
}

interface FetchProps {
  sortResponse?: () => void;
  token: string;
  endpoint: string;
  children: (p: FetchState) => React.ReactNode;
}

export default class CollectionFetch extends React.Component<
  FetchProps,
  FetchState
> {
  state = {
    posts: []
  }

  static defaultProps = {
    sortResponse: (x: any[]) => x,
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
    const { posts } = this.state
    return this.props.children({ posts })
  }
}
