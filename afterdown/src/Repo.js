import React, { Component, Fragment } from 'react'
import 'universal-fetch'

export default class extends Component {
  static async getInitialProps({ match, prefetch }) {
    const { user, repo } = match.params
    const response = await fetch(`https://api.github.com/repos/${user}/${repo}`)
    const post = await response.json()

    return { post, user, repo }
  }

  render() {
    const { post } = this.props

    return (
      <article style={{ padding: 16, marginLeft: 'auto', marginRight: 'auto', maxWidth: 528 }}>
        {post ? (
          <Fragment>
            <header>
              <h3>{post.name}</h3>
              <h4>{post.language}</h4>
              <time>{post.created_at}</time>
            </header>
            <section>
              <ul>
                <li>Open Issues: {post.open_issues_count}</li>
                <li>Forks: {post.forks_count}</li>
              </ul>
            </section>
          </Fragment>
        ) : (
          <h1>Loading</h1>
        )}
      </article>
    )
  }
}
