import React, { Component } from 'react'
import 'isomorphic-fetch'

export default class Index extends Component {
  static async getInitialProps() {
    const resp = await fetch(`http://localhost:4411/posts`, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNWEwNjI3MzY5NmFiZjQwNjJmYzE5OGJhIiwibmFtZSI6InRlc3QiLCJpYXQiOjE1MjE2ODI3NDIsImV4cCI6MTUzNzIzNDc0Mn0.TIgfOVxgI2jOH9tDFiYzmVjWyhZvsh7J5qbfwNXLXe0`
      }
    })

    const posts = await resp.json()

    return {
      posts
    }
  }

  render() {
    return (
      <div>
        <h1>Hello</h1>
      </div>
    )
  }
}
