import { Component } from 'react'
import orderBy from 'lodash/orderBy'
import { POST_ENDPOINT } from '../utils/urls'

export default class extends Component {
  state = {
    posts: []
  }

  static defaultProps = {
    sortResponse: x => x,
    endpoint: POST_ENDPOINT
  }

  getPosts = async () => {
    const req = await fetch(this.props.endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.props.token}`
      },
      mode: 'cors',
      cache: 'default'
    })

    const posts = orderBy(await req.json(), ['dateAdded'], ['desc'])

    this.setState({ posts })
  }

  // TODO: Move this to React Suspense!!
  // TODO: Or move to componentDidMount and add loading State
  componentWillMount() {
    this.getPosts()
  }

  render() {
    return this.props.children(this.state.posts)
  }
}
