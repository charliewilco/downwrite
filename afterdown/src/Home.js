import React, { Component } from 'react'
import Link from 'react-router-dom/Link'
import { Helmet } from 'react-helmet'
import 'universal-fetch'
import './Home.css'

export default class Home extends Component {
  static async getInitialProps({ req, res, match, history, location, ...ctx }) {
    const response = await fetch('https://api.github.com/users/charliewilco/repos')
    const posts = await response.json()

    return { posts }
  }

  constructor(props) {
    super()

    props.prefetch()
  }

  static defaultProps = {
    posts: []
  }

  render() {
    const { posts } = this.props
    return (
      <div className="Home">
        <Helmet>
          <title>Repos</title>
          <meta name="description" content="All the repos" />
        </Helmet>
        <div className="Home-header">
          <h2>Welcome to After.js</h2>
        </div>
        <ul className="HomeList">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <li key={i}>
                <Link to={`/${post.full_name}`}>{post.full_name}</Link>
              </li>
            ))
          ) : (
            <h1>Loading</h1>
          )}
        </ul>
        <Link to="/about">About -></Link>
      </div>
    )
  }
}
